CREATE DATABASE IF NOT EXISTS bloodbank;
USE bloodbank;

-- Blood Banks table
CREATE TABLE IF NOT EXISTS blood_banks (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_location (location)
);

-- Managers table
CREATE TABLE IF NOT EXISTS managers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blood_bank_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blood_bank_id (blood_bank_id)
);

-- Donors table
CREATE TABLE IF NOT EXISTS donors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blood_bank_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    last_donation_date DATE,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE,
    INDEX idx_blood_bank_id (blood_bank_id),
    INDEX idx_blood_type (blood_type),
    INDEX idx_last_donation (last_donation_date),
    INDEX idx_created_at (created_at)
);

-- Blood Stocks table (current inventory)
CREATE TABLE IF NOT EXISTS blood_stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blood_bank_id VARCHAR(50) NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    donor_id INT,
    status ENUM('Available', 'Expired', 'Utilized') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL,
    INDEX idx_blood_bank_id (blood_bank_id),
    INDEX idx_blood_type (blood_type),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    CHECK (quantity >= 0)
);

-- Expired Stocks table (archive)
CREATE TABLE IF NOT EXISTS expired_stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blood_bank_id VARCHAR(50) NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    quantity INT NOT NULL,
    collection_date DATE,
    expiry_date DATE NOT NULL,
    donor_id INT,
    reason TEXT,
    expired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL,
    INDEX idx_blood_bank_id (blood_bank_id),
    INDEX idx_expired_at (expired_at),
    INDEX idx_blood_type (blood_type)
);

-- Utilized Stocks table (archive)
CREATE TABLE IF NOT EXISTS utilized_stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blood_bank_id VARCHAR(50) NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    quantity INT NOT NULL,
    collection_date DATE,
    utilization_date DATE NOT NULL,
    donor_id INT,
    purpose VARCHAR(255) NOT NULL,
    recipient_details TEXT,
    utilized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL,
    INDEX idx_blood_bank_id (blood_bank_id),
    INDEX idx_utilized_at (utilized_at),
    INDEX idx_purpose (purpose)
);


-- Insert sample data for testing (optional)
-- INSERT INTO blood_banks (name, location, address, contact_number, email) VALUES
-- ('City General Hospital Blood Bank', 'New York', '123 Main St, New York, NY 10001', '+1-555-0100', 'bloodbank@cityhospital.com'),
-- ('Metro Medical Center', 'Los Angeles', '456 Oak Ave, Los Angeles, CA 90001', '+1-555-0200', 'bloodbank@metromedical.com');