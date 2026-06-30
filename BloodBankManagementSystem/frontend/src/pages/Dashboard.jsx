import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      setStats(response.data);
    } catch (error) {
      setError('Error fetching dashboard statistics');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  const statCards = [
    {
      title: 'Total Blood Units',
      value: stats?.totalStocks?.total_quantity || 0,
      icon: '🩸',
      color: 'primary',
      link: '/blood-stocks'
    },
    {
      title: 'Total Donors',
      value: stats?.totalDonors?.count || 0,
      icon: '👥',
      color: 'info',
      link: '/donors'
    },
    {
      title: 'Expired This Month',
      value: stats?.expiredThisMonth?.total_quantity || 0,
      icon: '⚠️',
      color: 'danger',
      link: '/reports'
    },
    {
      title: 'Utilized This Month',
      value: stats?.utilizedThisMonth?.total_quantity || 0,
      icon: '✅',
      color: 'success',
      link: '/reports'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 mb-6">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Blood Type Distribution */}
        <div className="card">
          <h2 className="card-title mb-4">Blood Type Distribution</h2>
          {stats?.bloodTypeDistribution && stats.bloodTypeDistribution.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Blood Type</th>
                    <th>Total Units</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bloodTypeDistribution.map((item, index) => (
                    <tr key={index}>
                      <td><strong>{item.blood_type}</strong></td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No blood stocks available</p>
          )}
        </div>

        {/* Expiry Alerts */}
        <div className="card">
          <h2 className="card-title mb-4">⚠️ Expiry Alerts (Next 7 Days)</h2>
          {stats?.expiryAlerts && stats.expiryAlerts.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Blood Type</th>
                    <th>Quantity</th>
                    <th>Expires In</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.expiryAlerts.slice(0, 5).map((alert, index) => (
                    <tr key={index}>
                      <td><strong>{alert.blood_type}</strong></td>
                      <td>{alert.quantity} units</td>
                      <td>
                        <span className={`badge ${alert.days_until_expiry <= 3 ? 'badge-danger' : 'badge-warning'}`}>
                          {alert.days_until_expiry} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No expiry alerts</p>
          )}
        </div>

        {/* Recent Activities */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 className="card-title mb-4">Recent Activities</h2>
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Blood Type</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivities.map((activity, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`badge ${activity.type === 'expired' ? 'badge-danger' : 'badge-success'}`}>
                          {activity.type}
                        </span>
                      </td>
                      <td><strong>{activity.blood_type}</strong></td>
                      <td>{activity.quantity} units</td>
                      <td>{new Date(activity.date).toLocaleDateString()}</td>
                      <td>{activity.reason || activity.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;