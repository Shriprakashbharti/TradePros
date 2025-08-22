import React, { useState } from 'react';
import api from '../../lib/api';

const ProfileForm = ({ profileData, onUpdate }) => {
  const [formData, setFormData] = useState({
    profile: {
      phone: profileData.profile?.phone || '',
      address: {
        street: profileData.profile?.address?.street || '',
        city: profileData.profile?.address?.city || '',
        state: profileData.profile?.address?.state || '',
        country: profileData.profile?.address?.country || '',
        pincode: profileData.profile?.address?.pincode || ''
      },
      panNumber: profileData.profile?.panNumber || '',
      aadhaarNumber: profileData.profile?.aadhaarNumber || '',
      dateOfBirth: profileData.profile?.dateOfBirth ? 
        new Date(profileData.profile.dateOfBirth).toISOString().split('T')[0] : ''
    },
    preferences: {
      notifications: {
        email: profileData.preferences?.notifications?.email ?? true,
        sms: profileData.preferences?.notifications?.sms ?? false,
        push: profileData.preferences?.notifications?.push ?? true
      },
      riskProfile: profileData.preferences?.riskProfile || 'moderate'
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('profile.')) {
      const field = name.replace('profile.', '');
      setFormData(prev => ({
        ...prev,
        profile: { ...prev.profile, [field]: value }
      }));
    } else if (name.startsWith('address.')) {
      const field = name.replace('address.', '');
      setFormData(prev => ({
        ...prev,
        profile: { 
          ...prev.profile, 
          address: { ...prev.profile.address, [field]: value } 
        }
      }));
    } else if (name.startsWith('notifications.')) {
      const field = name.replace('notifications.', '');
      setFormData(prev => ({
        ...prev,
        preferences: { 
          ...prev.preferences, 
          notifications: { ...prev.preferences.notifications, [field]: checked } 
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: value }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put('/api/profile', formData);
      setMessage('Profile updated successfully!');
      onUpdate();
    } catch (error) {
      setMessage('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="profile.phone"
                value={formData.profile.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="10-digit phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="profile.dateOfBirth"
                value={formData.profile.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Address</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.profile.address.street}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.profile.address.city}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.profile.address.state}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.profile.address.country}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.profile.address.pincode}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="6-digit pincode"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">KYC Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">PAN Number</label>
              <input
                type="text"
                name="profile.panNumber"
                value={formData.profile.panNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., ABCDE1234F"
                maxLength="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
              <input
                type="text"
                name="profile.aadhaarNumber"
                value={formData.profile.aadhaarNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="12-digit number"
                maxLength="12"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Profile</label>
              <select
                name="riskProfile"
                value={formData.preferences.riskProfile}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifications.email"
                    checked={formData.preferences.notifications.email}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifications.sms"
                    checked={formData.preferences.notifications.sms}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">SMS Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifications.push"
                    checked={formData.preferences.notifications.push}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;