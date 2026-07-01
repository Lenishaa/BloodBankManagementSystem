import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    // Blood Bank details
    bloodBankId: '',
    bloodBankName: '',
    location: '',
    address: '',
    contactNumber: '',
    email: '',
    // Manager details
    password: '',
    confirmPassword: '',
    managerName: '',
    managerEmail: '',
    managerPhone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1 className="auth-title">🩸 Blood Bank Management</h1>
          <p className="auth-subtitle">Register your blood bank</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold mb-3">Blood Bank Information</h3>
          
          <div className="form-group">
            <label className="form-label">Blood Bank ID *</label>
            <input
              type="text"
              name="bloodBankId"
              className="form-control"
              value={formData.bloodBankId}
              onChange={handleChange}
              placeholder="Enter unique blood bank ID"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Bank Name *</label>
            <input
              type="text"
              name="bloodBankName"
              className="form-control"
              value={formData.bloodBankName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                className="form-control"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
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

          <h3 className="text-lg font-semibold mb-3 mt-4">Manager Information</h3>

          <div className="form-group">
            <label className="form-label">Manager Name *</label>
            <input
              type="text"
              name="managerName"
              className="form-control"
              value={formData.managerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Manager Email</label>
              <input
                type="email"
                name="managerEmail"
                className="form-control"
                value={formData.managerEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Manager Phone</label>
              <input
                type="tel"
                name="managerPhone"
                className="form-control"
                value={formData.managerPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Registering...' : 'Register Blood Bank'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;