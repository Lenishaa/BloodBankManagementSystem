const db = require('../config/database');

// Auto-expire stocks that have passed their expiry date
exports.autoExpireStocks = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;

    // Find all available stocks that have expired
    const [expiredStocks] = await db.execute(
      'SELECT * FROM blood_stocks WHERE blood_bank_id = ? AND status = "Available" AND expiry_date < CURDATE()',
      [bloodBankId]
    );

    if (expiredStocks.length === 0) {
      return res.json({ message: 'No stocks to expire', count: 0 });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let expiredCount = 0;

      for (const stock of expiredStocks) {
        // Insert into expired_stocks archive
        await connection.execute(
          'INSERT INTO expired_stocks (blood_bank_id, blood_type, quantity, collection_date, expiry_date, donor_id, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [bloodBankId, stock.blood_type, stock.quantity, stock.collection_date, stock.expiry_date, stock.donor_id, 'Auto-expired (expiry date passed)']
        );

        // Update status in blood_stocks
        await connection.execute(
          'UPDATE blood_stocks SET status = "Expired" WHERE id = ?',
          [stock.id]
        );

        expiredCount++;
      }

      await connection.commit();
      res.json({ 
        message: `Successfully expired ${expiredCount} stock(s)`, 
        count: expiredCount 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error auto-expiring stocks', error: error.message });
  }
};

// Get all blood stocks for current blood bank
exports.getAllStocks = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { bloodType, status, expiryStatus } = req.query;

    let query = 'SELECT * FROM blood_stocks WHERE blood_bank_id = ?';
    const params = [bloodBankId];

    if (bloodType) {
      query += ' AND blood_type = ?';
      params.push(bloodType);
    }

    if (status === 'Expiring Soon') {
      query += ' AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status = "Available"';
    } else if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY expiry_date ASC';

    const [stocks] = await db.execute(query, params);
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blood stocks', error: error.message });
  }
};

// Get blood stock by ID
exports.getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;

    const [stocks] = await db.execute(
      'SELECT * FROM blood_stocks WHERE id = ? AND blood_bank_id = ?',
      [id, bloodBankId]
    );

    if (stocks.length === 0) {
      return res.status(404).json({ message: 'Blood stock not found' });
    }

    res.json(stocks[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blood stock', error: error.message });
  }
};

// Add new blood stock
exports.addStock = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { bloodType, quantity, collectionDate, expiryDate, donorId, status } = req.body;

    const [result] = await db.execute(
      'INSERT INTO blood_stocks (blood_bank_id, blood_type, quantity, collection_date, expiry_date, donor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [bloodBankId, bloodType, quantity, collectionDate, expiryDate, donorId || null, status || 'Available']
    );

    res.status(201).json({
      message: 'Blood stock added successfully',
      stockId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding blood stock', error: error.message });
  }
};

// Update blood stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;
    const { bloodType, quantity, collectionDate, expiryDate, donorId, status } = req.body;

    // First, get the current stock details
    const [currentStock] = await db.execute(
      'SELECT * FROM blood_stocks WHERE id = ? AND blood_bank_id = ?',
      [id, bloodBankId]
    );

    if (currentStock.length === 0) {
      return res.status(404).json({ message: 'Blood stock not found' });
    }

    const stock = currentStock[0];

    // Update blood_stocks table
    const [result] = await db.execute(
      'UPDATE blood_stocks SET blood_type = ?, quantity = ?, collection_date = ?, expiry_date = ?, donor_id = ?, status = ? WHERE id = ? AND blood_bank_id = ?',
      [bloodType, quantity, collectionDate, expiryDate, donorId || null, status, id, bloodBankId]
    );

    // Handle archive table updates based on status changes
    if (stock.status === 'Expired' && status !== 'Expired') {
      // Changing from Expired to something else - delete from expired_stocks archive
      await db.execute(
        'DELETE FROM expired_stocks WHERE blood_bank_id = ? AND blood_type = ? AND quantity = ? AND collection_date = ?',
        [bloodBankId, stock.blood_type, stock.quantity, stock.collection_date]
      );
    } else if (stock.status === 'Utilized' && status !== 'Utilized') {
      // Changing from Utilized to something else - delete from utilized_stocks archive
      await db.execute(
        'DELETE FROM utilized_stocks WHERE blood_bank_id = ? AND blood_type = ? AND quantity = ? AND collection_date = ?',
        [bloodBankId, stock.blood_type, stock.quantity, stock.collection_date]
      );
    } else if (stock.status === 'Expired' && status === 'Expired') {
      // Still Expired, but updating details - update expired_stocks archive
      await db.execute(
        'UPDATE expired_stocks SET blood_type = ?, quantity = ?, collection_date = ?, expiry_date = ?, donor_id = ? WHERE blood_bank_id = ? AND blood_type = ? AND quantity = ? AND collection_date = ?',
        [bloodType, quantity, collectionDate, expiryDate, donorId || null, bloodBankId, stock.blood_type, stock.quantity, stock.collection_date]
      );
    } else if (stock.status === 'Utilized' && status === 'Utilized') {
      // Still Utilized, but updating details - update utilized_stocks archive
      await db.execute(
        'UPDATE utilized_stocks SET blood_type = ?, quantity = ?, collection_date = ?, donor_id = ? WHERE blood_bank_id = ? AND blood_type = ? AND quantity = ? AND collection_date = ?',
        [bloodType, quantity, collectionDate, donorId || null, bloodBankId, stock.blood_type, stock.quantity, stock.collection_date]
      );
    } else if (stock.status !== 'Expired' && status === 'Expired') {
      // Changing from any other status to Expired - insert into expired_stocks archive
      await db.execute(
        'INSERT INTO expired_stocks (blood_bank_id, blood_type, quantity, collection_date, expiry_date, donor_id, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bloodBankId, bloodType, quantity, collectionDate, expiryDate, donorId || null, 'Manually expired']
      );
    } else if (stock.status !== 'Utilized' && status === 'Utilized') {
      // Changing from any other status to Utilized - insert into utilized_stocks archive
      await db.execute(
        'INSERT INTO utilized_stocks (blood_bank_id, blood_type, quantity, collection_date, utilization_date, donor_id, purpose, recipient_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [bloodBankId, bloodType, quantity, collectionDate, new Date().toISOString().split('T')[0], donorId || null, 'Manual', '']
      );
    }

    res.json({ message: 'Blood stock updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blood stock', error: error.message });
  }
};

// Delete blood stock
exports.deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;

    // First, get the stock details to check its status
    const [stock] = await db.execute(
      'SELECT * FROM blood_stocks WHERE id = ? AND blood_bank_id = ?',
      [id, bloodBankId]
    );

    if (stock.length === 0) {
      return res.status(404).json({ message: 'Blood stock not found' });
    }

    const stockData = stock[0];

    // Delete from archive tables if status is Expired or Utilized
    if (stockData.status === 'Expired') {
      await db.execute(
        'DELETE FROM expired_stocks WHERE blood_bank_id = ? AND blood_type = ? AND quantity = ? AND collection_date = ?',
        [bloodBankId, stockData.blood_type, stockData.quantity, stockData.collection_date]
      );
    } else if (stockData.status === 'Utilized') {
      await db.execute(
        'DELETE FROM utilized_stocks WHERE blood_bank_id = ? AND blood_type = ? AND quantity = ? AND collection_date = ?',
        [bloodBankId, stockData.blood_type, stockData.quantity, stockData.collection_date]
      );
    }

    // Delete from main blood_stocks table
    const [result] = await db.execute(
      'DELETE FROM blood_stocks WHERE id = ? AND blood_bank_id = ?',
      [id, bloodBankId]
    );

    res.json({ message: 'Blood stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blood stock', error: error.message });
  }
};

// Get blood stock summary
exports.getStockSummary = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;

    const [summary] = await db.execute(
      'SELECT blood_type, SUM(quantity) as total_quantity, COUNT(*) as total_units FROM blood_stocks WHERE blood_bank_id = ? AND status = "Available" GROUP BY blood_type',
      [bloodBankId]
    );

    // Get naturally expired stocks from blood_stocks (only those still marked as Available)
    const [naturallyExpired] = await db.execute(
      'SELECT COUNT(*) as count, SUM(quantity) as total FROM blood_stocks WHERE blood_bank_id = ? AND expiry_date < CURDATE() AND status = "Available"',
      [bloodBankId]
    );

    // Get manually expired stocks from expired_stocks archive
    const [manuallyExpired] = await db.execute(
      'SELECT COUNT(*) as count, SUM(quantity) as total FROM expired_stocks WHERE blood_bank_id = ?',
      [bloodBankId]
    );

    // Combine both expired counts - ensure numeric addition
    const expiredCount = [
      {
        count: (parseInt(naturallyExpired[0]?.count) || 0) + (parseInt(manuallyExpired[0]?.count) || 0),
        total: (parseInt(naturallyExpired[0]?.total) || 0) + (parseInt(manuallyExpired[0]?.total) || 0)
      }
    ];

    const [expiringSoonCount] = await db.execute(
      'SELECT COUNT(*) as count, SUM(quantity) as total FROM blood_stocks WHERE blood_bank_id = ? AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status = "Available"',
      [bloodBankId]
    );

    res.json({
      byBloodType: summary,
      expired: expiredCount[0],
      expiringSoon: expiringSoonCount[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock summary', error: error.message });
  }
};

// Mark stock as expired
exports.markAsExpired = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;
    const { reason } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Get stock details
      const [stocks] = await connection.execute(
        'SELECT * FROM blood_stocks WHERE id = ? AND blood_bank_id = ?',
        [id, bloodBankId]
      );

      if (stocks.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Blood stock not found' });
      }

      const stock = stocks[0];

      // Insert into expired_stocks
      await connection.execute(
        'INSERT INTO expired_stocks (blood_bank_id, blood_type, quantity, collection_date, expiry_date, donor_id, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bloodBankId, stock.blood_type, stock.quantity, stock.collection_date, stock.expiry_date, stock.donor_id, reason || 'Expired']
      );

      // Update status in blood_stocks
      await connection.execute(
        'UPDATE blood_stocks SET status = "Expired" WHERE id = ?',
        [id]
      );

      await connection.commit();
      res.json({ message: 'Blood stock marked as expired successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error marking stock as expired', error: error.message });
  }
};

// Mark stock as utilized
exports.markAsUtilized = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;
    const { purpose, recipientDetails, utilizationDate } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Get stock details
      const [stocks] = await connection.execute(
        'SELECT * FROM blood_stocks WHERE id = ? AND blood_bank_id = ?',
        [id, bloodBankId]
      );

      if (stocks.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Blood stock not found' });
      }

      const stock = stocks[0];

      // Insert into utilized_stocks
      await connection.execute(
        'INSERT INTO utilized_stocks (blood_bank_id, blood_type, quantity, collection_date, utilization_date, donor_id, purpose, recipient_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [bloodBankId, stock.blood_type, stock.quantity, stock.collection_date, utilizationDate || new Date().toISOString().split('T')[0], stock.donor_id, purpose, recipientDetails || '']
      );

      // Update status in blood_stocks
      await connection.execute(
        'UPDATE blood_stocks SET status = "Utilized" WHERE id = ?',
        [id]
      );

      await connection.commit();
      res.json({ message: 'Blood stock marked as utilized successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error marking stock as utilized', error: error.message });
  }
};