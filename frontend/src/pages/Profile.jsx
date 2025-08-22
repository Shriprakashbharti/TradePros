import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../store/auth';
import api from '../lib/api';
import ProfileForm from '../components/Profile/ProfileForm';
import BankAccounts from '../components/Profile/BankAccounts';
import AccountSummary from '../components/Profile/AccountSummary';
import SecuritySettings from '../components/Profile/SecuritySetting';

const Profile = () => {
  const { user, loadMe } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchProfileData with useCallback to avoid infinite re-renders
  const fetchProfileData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/api/profile');
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setLoading(true);
        // If user data is not loaded, load it first
        if (!user?.id) {
          await loadMe();
        }
        // Then fetch profile data
        await fetchProfileData();
      } catch (error) {
        console.error('Error initializing profile:', error);
        setError('Failed to initialize profile');
        setLoading(false);
      }
    };

    initializeProfile();

    // Set up interval for refreshing data only after initial load
    const interval = setInterval(fetchProfileData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [user?.id, loadMe, fetchProfileData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 bg-red-100 p-4 rounded-md">
          {error}
          <button 
            onClick={fetchProfileData}
            className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">No profile data available</div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', name: 'Account Summary' },
    { id: 'profile', name: 'Profile Details' },
    { id: 'bank', name: 'Bank Accounts' },
    { id: 'security', name: 'Security' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <AccountSummary profileData={profileData} />;
      case 'profile':
        return <ProfileForm profileData={profileData} onUpdate={fetchProfileData} />;
      case 'bank':
        return <BankAccounts bankAccounts={profileData.profile?.bankAccounts || []} onUpdate={fetchProfileData} />;
      case 'security':
        return <SecuritySettings onPasswordChange={fetchProfileData} />;
      default:
        return <AccountSummary profileData={profileData} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-indigo-100">Manage your account settings and preferences</p>
          <div className="mt-2 text-sm">
            <span className="bg-indigo-800 bg-opacity-50 px-2 py-1 rounded">
              User ID: {user?.id}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;