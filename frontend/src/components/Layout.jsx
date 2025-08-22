import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  WalletIcon,
  ShieldExclamationIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)

  useEffect(() => {
    if (!socket || !user) return;

    // Order updates
    socket.on('orders:updated', (data) => {
      const notification = {
        id: Date.now(),
        type: 'order',
        title: `Order ${data.status}`,
        message: `${data.side} ${data.symbol} - ${data.filledQty}/${data.qty} filled`,
        read: false,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev.slice(0, 19)]);
      setUnreadCount(prev => prev + 1);
    });

    // Trade executions
    socket.on('trades:updated', (data) => {
      const notification = {
        id: Date.now(),
        type: 'trade',
        title: 'Trade Executed',
        message: `${data.side} ${data.qty} ${data.symbol} @ ₹${data.price}`,
        read: false,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev.slice(0, 19)]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('orders:updated');
      socket.off('trades:updated');
    };
  }, [socket, user]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-indigo-600">TradePro</h1>
        </div>
        {user ? (
          <div className="flex items-center space-x-2">
            {/* Notification Bell for Mobile */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-1 rounded-full hover:bg-gray-100 relative"
              >
                <BellIcon className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              
              {/* Mobile Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      <div className="flex space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={clearAllNotifications}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="space-x-2">
            <Link to="/login" className="text-sm px-3 py-1 border rounded-md">
              Login
            </Link>
          </div>
        )}
      </header>

      {/* Sidebar - Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-2 py-4 space-y-1">
                <MobileNavItem to="/dashboard" icon={<ChartBarIcon className="h-5 w-5" />}>
                  Dashboard
                </MobileNavItem>
                <MobileNavItem to="/trading" icon={<ArrowTrendingUpIcon className="h-5 w-5" />}>
                  Trading
                </MobileNavItem>
                <MobileNavItem to="/orders" icon={<DocumentTextIcon className="h-5 w-5" />}>
                  Orders
                </MobileNavItem>
                <MobileNavItem to="/portfolio" icon={<WalletIcon className="h-5 w-5" />}>
                  Portfolio
                </MobileNavItem>
                <MobileNavItem to="/risk" icon={<ShieldExclamationIcon className="h-5 w-5" />}>
                  Risk
                </MobileNavItem>
                <MobileNavItem to="/profile" icon={<UserCircleIcon className="h-5 w-5" />}>
                  My Profile
                </MobileNavItem>
                {user?.role === 'admin' && (
                  <MobileNavItem to="/admin" icon={<Cog6ToothIcon className="h-5 w-5" />}>
                    Admin
                  </MobileNavItem>
                )}
              </nav>
            </div>
            {user && (
              <div className="p-4 border-t border-gray-200">
                <button 
                  onClick={() => { logout(); navigate('/login') }}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-lg">
          <div className="flex items-center space-x-3 px-6 py-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h1 className="font-bold text-2xl">TradePro</h1>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <DesktopNavItem to="/dashboard" icon={<ChartBarIcon className="h-5 w-5" />}>
              Dashboard
            </DesktopNavItem>
            <DesktopNavItem to="/trading" icon={<ArrowTrendingUpIcon className="h-5 w-5" />}>
              Trading
            </DesktopNavItem>
            <DesktopNavItem to="/orders" icon={<DocumentTextIcon className="h-5 w-5" />}>
              Orders
            </DesktopNavItem>
            <DesktopNavItem to="/portfolio" icon={<WalletIcon className="h-5 w-5" />}>
              Portfolio
            </DesktopNavItem>
            <DesktopNavItem to="/risk" icon={<ShieldExclamationIcon className="h-5 w-5" />}>
              Risk
            </DesktopNavItem>
            <DesktopNavItem to="/profile" icon={<UserCircleIcon className="h-5 w-5" />}>
              My Profile
            </DesktopNavItem>
            {user?.role === 'admin' && (
              <DesktopNavItem to="/admin" icon={<Cog6ToothIcon className="h-5 w-5" />}>
                Admin
              </DesktopNavItem>
            )}
          </nav>

          {user && (
            <div className="p-4 border-t border-indigo-700">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-indigo-200 truncate">{user.role}</p>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/login') }}
                  className="text-indigo-200 hover:text-white"
                  title="Sign out"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Desktop */}
        <header className="hidden md:flex bg-white border-b border-gray-200 py-3 px-6 items-center justify-between">
          <div className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.name || 'Trader'}!
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell for Desktop */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 rounded-full hover:bg-gray-100 relative"
              >
                <BellIcon className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              
              {/* Desktop Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      <div className="flex space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={clearAllNotifications}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden lg:block">
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Reusable component for desktop navigation items
function DesktopNavItem({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-indigo-700 text-white shadow-md' 
          : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
      }`}
    >
      <span className="mr-3 flex-shrink-0">
        {React.cloneElement(icon, { className: `h-5 w-5 ${icon.props.className || ''}` })}
      </span>
      {children}
    </NavLink>
  )
}

// Reusable component for mobile navigation items
function MobileNavItem({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `group flex items-center px-3 py-2 text-base font-medium rounded-md ${
        isActive 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="mr-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500">
        {React.cloneElement(icon, { className: `h-6 w-6 ${icon.props.className || ''}` })}
      </span>
      {children}
    </NavLink>
  )
}