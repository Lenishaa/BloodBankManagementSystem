import { useState, useEffect } from 'react';
import axios from 'axios';

function Donors() {
  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [filters, setFilters] = useState({
    bloodType: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    bloodType: 'A+',
    contactNumber: '',
    email: '',
    address: '',
    lastDonationDate: '',
    medicalNotes: ''
  });

  useEffect(() => {
    fetchDonors();
    fetchStats();
  }, [filters]);

  const fetchDonors = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.bloodType) params.append('bloodType', filters.bloodType);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/donors?${params}`);
      setDonors(response.data);
    } catch (error) {
      setError('Error fetching donors');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/donors/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDonor) {
        await axios.put(`/api/donors/${editingDonor.id}`, formData);
      } else {
        await axios.post('/api/donors', formData);
      }
      setShowModal(false);
      setEditingDonor(null);
      resetForm();
      fetchDonors();
      fetchStats();
    } catch (error) {
      setError('Error saving donor');
      console.error('Error:', error);
    }
  };

  const handleEdit = (donor) => {
    setEditingDonor(donor);
    setFormData({
      fullName: donor.full_name,
      age: donor.age,
      gender: donor.gender,
      bloodType: donor.blood_type,
      contactNumber: donor.contact_number,
      email: donor.email || '',
      address: donor.address || '',
      lastDonationDate: donor.last_donation_date || '',
      medicalNotes: donor.medical_notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await axios.delete(`/api/donors/${id}`);
        fetchDonors();
        fetchStats();
      } catch (error) {
        setError('Error deleting donor');
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      age: '',
      gender: 'Male',
      bloodType: 'A+',
      contactNumber: '',
      email: '',
      address: '',
      lastDonationDate: '',
      medicalNotes: ''
    });
  };

  const openAddModal = () => {
    setEditingDonor(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Donors Management</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          + Add Donor
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card">
            <h3 className="text-sm text-muted mb-2">Total Donors</h3>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-muted mb-2">Blood Types</h3>
            <p className="text-2xl font-bold text-info">{stats.byBloodType?.length || 0}</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-muted mb-2">Recent Donors</h3>
            <p className="text-2xl font-bold text-success">{stats.recentDonors?.length || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group mb-0">
            <select
              name="bloodType"
              className="form-control"
              value={filters.bloodType}
              onChange={handleFilterChange}
            >
              <option value="">All Blood Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="form-group mb-0">
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Search by name, contact, or email..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Donors Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Blood Type</th>
                <th>Contact</th>
                <th>Last Donation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No donors found
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id}>
                    <td><strong>#{donor.id}</strong></td>
                    <td><strong>{donor.full_name}</strong></td>
                    <td>{donor.age} years</td>
                    <td>{donor.gender}</td>
                    <td>
                      <span className="badge badge-danger">{donor.blood_type}</span>
                    </td>
                    <td>{donor.contact_number}</td>
                    <td>
                      {donor.last_donation_date 
                        ? new Date(donor.last_donation_date).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(donor)}
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(donor.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingDonor ? 'Edit Donor' : 'Add Donor'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline btn-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <input
                      type="number"
                      name="age"
                      className="form-control"
                      value={formData.age}
                      onChange={handleChange}
                      min="18"
                      max="65"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select
                      name="gender"
                      className="form-control"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Type *</label>
                  <select
                    name="bloodType"
                    className="form-control"
                    value={formData.bloodType}
                    onChange={handleChange}
                    required
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    className="form-control"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Donation Date</label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    className="form-control"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Notes</label>
                  <textarea
                    name="medicalNotes"
                    className="form-control"
                    value={formData.medicalNotes}
                    onChange={handleChange}
                    rows="2"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDonor ? 'Update' : 'Add'} Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Donors;