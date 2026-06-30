const db = require('../config/database');

// Get expired stocks report
exports.getExpiredStocks = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM expired_stocks WHERE blood_bank_id = ?';
    const params = [bloodBankId];

    if (startDate) {
      query += ' AND expired_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND expired_at <= ?';
      params.push(endDate + ' 23:59:59');
    }

    query += ' ORDER BY expired_at DESC';

    const [expiredStocks] = await db.execute(query, params);

    // Get summary
    const [summary] = await db.execute(
      'SELECT COUNT(*) as total_units, SUM(quantity) as total_quantity, blood_type FROM expired_stocks WHERE blood_bank_id = ? GROUP BY blood_type',
      [bloodBankId]
    );

    res.json({
      stocks: expiredStocks,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expired stocks', error: error.message });
  }
};

// Get utilized stocks report
exports.getUtilizedStocks = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { startDate, endDate, purpose } = req.query;

    let query = 'SELECT * FROM utilized_stocks WHERE blood_bank_id = ?';
    const params = [bloodBankId];

    if (startDate) {
      query += ' AND utilized_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND utilized_at <= ?';
      params.push(endDate + ' 23:59:59');
    }

    if (purpose) {
      query += ' AND purpose = ?';
      params.push(purpose);
    }

    query += ' ORDER BY utilized_at DESC';

    const [utilizedStocks] = await db.execute(query, params);

    // Get summary by purpose
    const [summaryByPurpose] = await db.execute(
      'SELECT purpose, COUNT(*) as total_units, SUM(quantity) as total_quantity FROM utilized_stocks WHERE blood_bank_id = ? GROUP BY purpose',
      [bloodBankId]
    );

    // Get summary by blood type
    const [summaryByBloodType] = await db.execute(
      'SELECT blood_type, COUNT(*) as total_units, SUM(quantity) as total_quantity FROM utilized_stocks WHERE blood_bank_id = ? GROUP BY blood_type',
      [bloodBankId]
    );

    res.json({
      stocks: utilizedStocks,
      summaryByPurpose,
      summaryByBloodType
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching utilized stocks', error: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;

    // Total stocks
    const [totalStocks] = await db.execute(
      'SELECT COUNT(*) as count, SUM(quantity) as total_quantity FROM blood_stocks WHERE blood_bank_id = ? AND status = "Available"',
      [bloodBankId]
    );

    // Total donors
    const [totalDonors] = await db.execute(
      'SELECT COUNT(*) as count FROM donors WHERE blood_bank_id = ?',
      [bloodBankId]
    );

    // Expired stocks this month
    const [expiredThisMonth] = await db.execute(
      'SELECT COUNT(*) as count, SUM(quantity) as total_quantity FROM expired_stocks WHERE blood_bank_id = ? AND MONTH(expired_at) = MONTH(CURDATE()) AND YEAR(expired_at) = YEAR(CURDATE())',
      [bloodBankId]
    );

    // Utilized stocks this month
    const [utilizedThisMonth] = await db.execute(
      'SELECT COUNT(*) as count, SUM(quantity) as total_quantity FROM utilized_stocks WHERE blood_bank_id = ? AND MONTH(utilized_at) = MONTH(CURDATE()) AND YEAR(utilized_at) = YEAR(CURDATE())',
      [bloodBankId]
    );

    // Blood type distribution
    const [bloodTypeDistribution] = await db.execute(
      'SELECT blood_type, SUM(quantity) as total FROM blood_stocks WHERE blood_bank_id = ? AND status = "Available" GROUP BY blood_type ORDER BY total DESC',
      [bloodBankId]
    );

    // Recent activities (last 10)
    const [recentExpired] = await db.execute(
      'SELECT "expired" as type, blood_type, quantity, expired_at as date, reason FROM expired_stocks WHERE blood_bank_id = ? ORDER BY expired_at DESC LIMIT 5',
      [bloodBankId]
    );

    const [recentUtilized] = await db.execute(
      'SELECT "utilized" as type, blood_type, quantity, utilized_at as date, purpose FROM utilized_stocks WHERE blood_bank_id = ? ORDER BY utilized_at DESC LIMIT 5',
      [bloodBankId]
    );

    const recentActivities = [...recentExpired, ...recentUtilized]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Expiry alerts
    const [expiryAlerts] = await db.execute(
      'SELECT id, blood_type, quantity, expiry_date, DATEDIFF(expiry_date, CURDATE()) as days_until_expiry FROM blood_stocks WHERE blood_bank_id = ? AND status = "Available" AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) ORDER BY expiry_date ASC',
      [bloodBankId]
    );

    res.json({
      totalStocks: totalStocks[0],
      totalDonors: totalDonors[0],
      expiredThisMonth: expiredThisMonth[0],
      utilizedThisMonth: utilizedThisMonth[0],
      bloodTypeDistribution,
      recentActivities,
      expiryAlerts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
};

// Get monthly report
exports.getMonthlyReport = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { year, month } = req.query;

    const yearValue = year || new Date().getFullYear();
    const monthValue = month || new Date().getMonth() + 1;

    // Blood collection (added to stock)
    const [collected] = await db.execute(
      'SELECT COUNT(*) as total_units, SUM(quantity) as total_quantity, blood_type FROM blood_stocks WHERE blood_bank_id = ? AND MONTH(collection_date) = ? AND YEAR(collection_date) = ? GROUP BY blood_type',
      [bloodBankId, monthValue, yearValue]
    );

    // Expired
    const [expired] = await db.execute(
      'SELECT COUNT(*) as total_units, SUM(quantity) as total_quantity, blood_type FROM expired_stocks WHERE blood_bank_id = ? AND MONTH(expired_at) = ? AND YEAR(expired_at) = ? GROUP BY blood_type',
      [bloodBankId, monthValue, yearValue]
    );

    // Utilized
    const [utilized] = await db.execute(
      'SELECT COUNT(*) as total_units, SUM(quantity) as total_quantity, blood_type FROM utilized_stocks WHERE blood_bank_id = ? AND MONTH(utilized_at) = ? AND YEAR(utilized_at) = ? GROUP BY blood_type',
      [bloodBankId, monthValue, yearValue]
    );

    // New donors
    const [newDonors] = await db.execute(
      'SELECT COUNT(*) as count FROM donors WHERE blood_bank_id = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?',
      [bloodBankId, monthValue, yearValue]
    );

    res.json({
      collected,
      expired,
      utilized,
      newDonors: newDonors[0].count,
      month: monthValue,
      year: yearValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly report', error: error.message });
  }
};