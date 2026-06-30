const db = require('../config/database');

// Get all donors for current blood bank
exports.getAllDonors = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { bloodType, search } = req.query;

    let query = 'SELECT * FROM donors WHERE blood_bank_id = ?';
    const params = [bloodBankId];

    if (bloodType) {
      query += ' AND blood_type = ?';
      params.push(bloodType);
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR contact_number LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [donors] = await db.execute(query, params);
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors', error: error.message });
  }
};

// Get donor by ID
exports.getDonorById = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;

    const [donors] = await db.execute(
      'SELECT * FROM donors WHERE id = ? AND blood_bank_id = ?',
      [id, bloodBankId]
    );

    if (donors.length === 0) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json(donors[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donor', error: error.message });
  }
};

// Add new donor
exports.addDonor = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { fullName, age, gender, bloodType, contactNumber, email, address, lastDonationDate, medicalNotes } = req.body;

    const [result] = await db.execute(
      'INSERT INTO donors (blood_bank_id, full_name, age, gender, blood_type, contact_number, email, address, last_donation_date, medical_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [bloodBankId, fullName, age, gender, bloodType, contactNumber, email, address, lastDonationDate || null, medicalNotes || '']
    );

    res.status(201).json({
      message: 'Donor added successfully',
      donorId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding donor', error: error.message });
  }
};

// Update donor
exports.updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;
    const { fullName, age, gender, bloodType, contactNumber, email, address, lastDonationDate, medicalNotes } = req.body;

    const [result] = await db.execute(
      'UPDATE donors SET full_name = ?, age = ?, gender = ?, blood_type = ?, contact_number = ?, email = ?, address = ?, last_donation_date = ?, medical_notes = ? WHERE id = ? AND blood_bank_id = ?',
      [fullName, age, gender, bloodType, contactNumber, email, address, lastDonationDate || null, medicalNotes || '', id, bloodBankId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({ message: 'Donor updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating donor', error: error.message });
  }
};

// Delete donor
exports.deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodBankId = req.manager.bloodBankId;

    const [result] = await db.execute(
      'DELETE FROM donors WHERE id = ? AND blood_bank_id = ?',
      [id, bloodBankId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({ message: 'Donor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting donor', error: error.message });
  }
};

// Get donor statistics
exports.getDonorStats = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;

    const [totalDonors] = await db.execute(
      'SELECT COUNT(*) as count FROM donors WHERE blood_bank_id = ?',
      [bloodBankId]
    );

    const [byBloodType] = await db.execute(
      'SELECT blood_type, COUNT(*) as count FROM donors WHERE blood_bank_id = ? GROUP BY blood_type',
      [bloodBankId]
    );

    const [byGender] = await db.execute(
      'SELECT gender, COUNT(*) as count FROM donors WHERE blood_bank_id = ? GROUP BY gender',
      [bloodBankId]
    );

    const [recentDonors] = await db.execute(
      'SELECT * FROM donors WHERE blood_bank_id = ? ORDER BY created_at DESC LIMIT 5',
      [bloodBankId]
    );

    res.json({
      total: totalDonors[0].count,
      byBloodType,
      byGender,
      recentDonors
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donor statistics', error: error.message });
  }
};

// Get donors by blood type
exports.getDonorsByBloodType = async (req, res) => {
  try {
    const bloodBankId = req.manager.bloodBankId;
    const { bloodType } = req.params;

    const [donors] = await db.execute(
      'SELECT * FROM donors WHERE blood_bank_id = ? AND blood_type = ? ORDER BY full_name',
      [bloodBankId, bloodType]
    );

    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors', error: error.message });
  }
};