const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// Register new blood bank and manager
exports.register = async (req, res) => {
  try {
    const { bloodBankName, location, address, contactNumber, email, employeeId, password, managerName, managerEmail, managerPhone } = req.body;

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert blood bank
      const [bloodBankResult] = await connection.execute(
        'INSERT INTO blood_banks (name, location, address, contact_number, email) VALUES (?, ?, ?, ?, ?)',
        [bloodBankName, location, address, contactNumber, email]
      );

      const bloodBankId = bloodBankResult.insertId;

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert manager
      await connection.execute(
        'INSERT INTO managers (employee_id, password_hash, blood_bank_id, full_name, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [employeeId, passwordHash, bloodBankId, managerName, managerEmail, managerPhone]
      );

      await connection.commit();

      // Generate JWT token
      const token = jwt.sign(
        { managerId: bloodBankId, employeeId, bloodBankId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        message: 'Blood bank registered successfully',
        token,
        bloodBank: { id: bloodBankId, name: bloodBankName, location }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error registering blood bank', error: error.message });
  }
};

// Manager login
exports.login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    // Find manager
    const [managers] = await db.execute(
      'SELECT m.*, b.name as blood_bank_name, b.location FROM managers m JOIN blood_banks b ON m.blood_bank_id = b.id WHERE m.employee_id = ?',
      [employeeId]
    );

    if (managers.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const manager = managers[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, manager.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { managerId: manager.id, employeeId: manager.employee_id, bloodBankId: manager.blood_bank_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      manager: {
        id: manager.id,
        employeeId: manager.employee_id,
        fullName: manager.full_name,
        email: manager.email,
        bloodBankId: manager.blood_bank_id,
        bloodBankName: manager.blood_bank_name,
        location: manager.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get manager profile
exports.getProfile = async (req, res) => {
  try {
    const [managers] = await db.execute(
      'SELECT m.id, m.employee_id, m.full_name, m.email, m.phone, b.name as blood_bank_name, b.location, b.address, b.contact_number FROM managers m JOIN blood_banks b ON m.blood_bank_id = b.id WHERE m.id = ?',
      [req.manager.managerId]
    );

    if (managers.length === 0) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    res.json(managers[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};