import { useState, useEffect } from 'react';
import axios from 'axios';

function Reports() {
  const [expiredStocks, setExpiredStocks] = useState([]);
  const [utilizedStocks, setUtilizedStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expired');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    purpose: ''
  });

  useEffect(() => {
    fetchReports();
  }, [activeTab, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'expired') {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        const response = await axios.get(`/api/reports/expired?${params}`);
        setExpiredStocks(response.data.stocks);
      } else {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.purpose) params.append('purpose', filters.purpose);
        const response = await axios.get(`/api/reports/utilized?${params}`);
        setUtilizedStocks(response.data.stocks);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      purpose: ''
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('expired')}
            className={`btn ${activeTab === 'expired' ? 'btn-primary' : 'btn-outline'}`}
          >
            Expired Stocks
          </button>
          <button
            onClick={() => setActiveTab('utilized')}
            className={`btn ${activeTab === 'utilized' ? 'btn-primary' : 'btn-outline'}`}
          >
            Utilized Stocks
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="form-group mb-0">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          {activeTab === 'utilized' && (
            <div className="form-group mb-0">
              <label className="form-label">Purpose</label>
              <select
                name="purpose"
                className="form-control"
                value={filters.purpose}
                onChange={handleFilterChange}
              >
                <option value="">All Purposes</option>
                <option value="Transfusion">Transfusion</option>
                <option value="Emergency">Emergency</option>
                <option value="Surgery">Surgery</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>
        <button onClick={clearFilters} className="btn btn-outline btn-sm mt-3">
          Clear Filters
        </button>
      </div>

      {/* Expired Stocks Tab */}
      {activeTab === 'expired' && (
        <div className="card">
          <h2 className="card-title mb-4">Expired Blood Stocks</h2>
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : expiredStocks.length === 0 ? (
            <p className="text-muted text-center py-4">No expired stocks found</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Blood Type</th>
                    <th>Quantity</th>
                    <th>Collection Date</th>
                    <th>Expiry Date</th>
                    <th>Expired At</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredStocks.map((stock) => (
                    <tr key={stock.id}>
                      <td><strong>{stock.blood_type}</strong></td>
                      <td>{stock.quantity} units</td>
                      <td>{stock.collection_date ? new Date(stock.collection_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{new Date(stock.expiry_date).toLocaleDateString()}</td>
                      <td>{new Date(stock.expired_at).toLocaleDateString()}</td>
                      <td>{stock.reason || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Utilized Stocks Tab */}
      {activeTab === 'utilized' && (
        <div className="card">
          <h2 className="card-title mb-4">Utilized Blood Stocks</h2>
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : utilizedStocks.length === 0 ? (
            <p className="text-muted text-center py-4">No utilized stocks found</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Blood Type</th>
                    <th>Quantity</th>
                    <th>Collection Date</th>
                    <th>Utilization Date</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizedStocks.map((stock) => (
                    <tr key={stock.id}>
                      <td><strong>{stock.blood_type}</strong></td>
                      <td>{stock.quantity} units</td>
                      <td>{stock.collection_date ? new Date(stock.collection_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{new Date(stock.utilization_date).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-info">{stock.purpose}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;