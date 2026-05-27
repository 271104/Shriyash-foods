import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiMail, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="not-authenticated">
            <h2>Please login to view your profile</h2>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing && (
            <button 
              className="btn btn-outline"
              onClick={() => setIsEditing(true)}
            >
              <FiEdit2 />
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <FiUser size={48} />
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={user?.phone || ''}
                    disabled
                    className="disabled-input"
                  />
                  <small>Phone number cannot be changed</small>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <FiSave />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <FiX />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <FiUser />
                  <div>
                    <label>Full Name</label>
                    <span>{user?.name || 'Not provided'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FiMail />
                  <div>
                    <label>Email</label>
                    <span>{user?.email || 'Not provided'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FiPhone />
                  <div>
                    <label>Phone Number</label>
                    <span>{user?.phone}</span>
                    {user?.isPhoneVerified && (
                      <span className="verified-badge">Verified</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <h3>Order History</h3>
              <p>View your past orders and track current ones</p>
              <a href="/orders" className="btn btn-outline">
                View Orders
              </a>
            </div>

            <div className="stat-card">
              <h3>Saved Addresses</h3>
              <p>Manage your delivery addresses</p>
              <span className="coming-soon">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;