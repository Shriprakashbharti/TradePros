import React from 'react';

const AccountSummary = ({ profileData }) => {
  const availableBalance = profileData.balance - profileData.reservedBalance;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-sm">Available Balance</div>
        <div className="text-2xl font-bold text-green-600">₹{availableBalance.toFixed(2)}</div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-sm">Total Balance</div>
        <div className="text-2xl font-bold">₹{profileData.balance.toFixed(2)}</div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-sm">Reserved Balance</div>
        <div className="text-2xl font-bold text-amber-600">₹{profileData.reservedBalance.toFixed(2)}</div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-sm">Member Since</div>
        <div className="text-lg font-medium">
          {new Date(profileData.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 col-span-2">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Transactions</span>
            <span className="font-medium">{profileData.transactions?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Orders</span>
            <span className="font-medium">{profileData.orders?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Orders</span>
            <span className="font-medium">
              {profileData.orders?.filter(order => 
                ['PENDING', 'PARTIALLY_FILLED'].includes(order.status)
              ).length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 col-span-2">
        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Name</span>
            <span className="font-medium">{profileData.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Email</span>
            <span className="font-medium">{profileData.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone</span>
            <span className="font-medium">{profileData.profile?.phone || 'Not set'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;