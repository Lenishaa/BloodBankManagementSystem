import { useState, useEffect } from 'react';
import axios from 'axios';

function BloodStocks() {
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [filters, setFilters] = useState({
    bloodType: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    bloodType: 'A+',
    quantity: '',
    collectionDate: '',
    expiryDate: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchStocks();
    fetchSummary();
  }, [filters]);

  const fetchStocks = async () => {
    try {
      // Auto-expire stocks that have passed their expiry date
      await axios.patch('/api/blood-stocks/auto-expire');
      
      const params = new URLSearchParams();
      if (filters.bloodType) params.append('bloodType', filters.bloodType);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(`/api/blood-stocks?${params}`);
      setStocks(response.data);
    } catch (error) {
      setError('Error fetching blood stocks');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/api/blood-stocks/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
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
      if (editingStock) {
        await axios.put(`/api/blood-stocks/${editingStock.id}`, formData);
      } else {
        await axios.post('/api/blood-stocks', formData);
      }
      setShowModal(false);
      setEditingStock(null);
      resetForm();
      fetchStocks();
      fetchSummary();
      // Refresh dashboard stats to update recent activities
      try {
        await axios.get('/api/reports/dashboard');
      } catch (error) {
        console.error('Error refreshing dashboard:', error);
      }
    } catch (error) {
      setError('Error saving blood stock');
      console.error('Error:', error);
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    // Format dates to YYYY-MM-DD format for date input
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFormData({
      bloodType: stock.blood_type,
      quantity: stock.quantity,
      collectionDate: formatDate(stock.collection_date),
      expiryDate: formatDate(stock.expiry_date),
      status: stock.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blood stock?')) {
      try {
        await axios.delete(`/api/blood-stocks/${id}`);
        fetchStocks();
        fetchSummary();
      } catch (error) {
        setError('Error deleting blood stock');
        console.error('Error:', error);
      }
    }
  };

  const handleMarkAsExpired = async (id) => {
    const reason = prompt('Enter reason for expiration:');
    if (reason !== null) {
      try {
        await axios.patch(`/api/blood-stocks/${id}/expire`, { reason });
        fetchStocks();
        fetchSummary();
      } catch (error) {
        setError('Error marking stock as expired');
        console.error('Error:', error);
      }
    }
  };

  const handleMarkAsUtilized = async (id) => {
    const purpose = prompt('Enter purpose of utilization:');
    if (purpose !== null) {
      try {
        await axios.patch(`/api/blood-stocks/${id}/utilize`, { purpose });
        fetchStocks();
        fetchSummary();
      } catch (error) {
        setError('Error marking stock as utilized');
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bloodType: 'A+',
      quantity: '',
      collectionDate: '',
      expiryDate: '',
      status: 'Available'
    });
  };

  const openAddModal = () => {
    setEditingStock(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blood Stocks Management</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          + Add Blood Stock
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card">
            <h3 className="text-sm text-muted mb-2">Total Available Units</h3>
            <p className="text-2xl font-bold text-success">
              {summary.byBloodType?.reduce((sum, item) => sum + (parseInt(item.total_quantity) || 0), 0) || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-muted mb-2">Expired Stocks</h3>
            <p className="text-2xl font-bold text-danger">
              {parseInt(summary.expired?.total) || 0} units
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-muted mb-2">Expiring Soon (7 days)</h3>
            <p className="text-2xl font-bold text-warning">
              {parseInt(summary.expiringSoon?.total) || 0} units
            </p>
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
            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Utilized">Utilized</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blood Stocks Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Blood Type</th>
                <th>Quantity</th>
                <th>Collection Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No blood stocks found
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock.id}>
                    <td><strong>{stock.blood_type}</strong></td>
                    <td>{stock.quantity} units</td>
                    <td>{new Date(stock.collection_date).toLocaleDateString()}</td>
                    <td>{new Date(stock.expiry_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        stock.status === 'Available' ? 'badge-success' :
                        stock.status === 'Expired' ? 'badge-danger' :
                        stock.status === 'Utilized' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {stock.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </button>
                        {stock.status === 'Available' && (
                          <>
                            <button
                              onClick={() => handleMarkAsExpired(stock.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Expire
                            </button>
                            <button
                              onClick={() => handleMarkAsUtilized(stock.id)}
                              className="btn btn-success btn-sm"
                            >
                              Utilize
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(stock.id)}
                          className="btn btn-outline btn-sm"
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
                {editingStock ? 'Edit Blood Stock' : 'Add Blood Stock'}
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
                  <label className="form-label">Quantity (units) *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Collection Date *</label>
                    <input
                      type="date"
                      name="collectionDate"
                      className="form-control"
                      value={formData.collectionDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiry Date *</label>
                    <input
                      type="date"
                      name="expiryDate"
                      className="form-control"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {editingStock && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-control"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Available">Available</option>
                      {(editingStock.status === 'Expired' || editingStock.status === 'Utilized') && (
                        <option value={editingStock.status}>{editingStock.status}</option>
                      )}
                    </select>
                  </div>
                )}
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
                  {editingStock ? 'Update' : 'Add'} Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloodStocks;