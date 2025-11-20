import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  CheckCircle,
  Camera,
  Plane,
  LogOut,
  User as UserIcon,
  Bell,
  Settings,
  Users,
  CreditCard,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { User } from '../types';
import { JeffreySidebar } from './JeffreySidebar';
import { JeffreyProvider } from '../contexts/JeffreyContext';
import { authApi } from '../lib/api';
import gammaTravelBg from '../assets/gamma-travel-bg.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout?: () => void;
}

const navItems = [
  { path: '/app', label: 'Dashboard', icon: Home },
  { path: '/app/form-filler', label: 'Form Filler', icon: FileText },
  { path: '/app/validator', label: 'Validator', icon: CheckCircle },
  { path: '/app/photo-compliance', label: 'Photos', icon: Camera },
  { path: '/app/travel-planner', label: 'Travel', icon: Plane },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      if (onLogout) {
        onLogout();
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <JeffreyProvider>
      <div className="min-h-screen relative">
        {/* Fixed Background Image */}
        <div className="fixed inset-0 z-0">
          <img src={gammaTravelBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        </div>

        {/* Top Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/40 backdrop-blur-xl border-b border-white/30 z-50 shadow-sm">
          <div className="h-full flex items-center justify-between px-6">
            {/* Logo */}
            <Link to="/app" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600
                           flex items-center justify-center text-white font-bold text-sm"
              >
                VD
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                VisaDocs
              </span>
            </Link>

            {/* Main Navigation (visible on larger screens) */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: Notifications & User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-neutral-500 hover:text-neutral-700 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-neutral-900">
                    {user.firstName || user.name || user.email}
                  </p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>

                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {(user.firstName?.[0] || user.name?.[0] || user.email[0]).toUpperCase()}
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white/60 backdrop-blur-2xl rounded-lg shadow-lg border border-white/40
                               opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                  >
                    <div className="py-1">
                      {/* Profile Section */}
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs font-medium text-neutral-500 uppercase">Profile & Auto-fill</p>
                      </div>
                      <Link
                        to="/app/profile-settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <UserIcon className="w-4 h-4" />
                        Personal Information
                      </Link>
                      <Link
                        to="/app/profile-settings?tab=family"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Users className="w-4 h-4" />
                        Family Members
                      </Link>

                      {/* Account Section */}
                      <div className="px-4 py-2 border-t border-b border-neutral-100 mt-1">
                        <p className="text-xs font-medium text-neutral-500 uppercase">Account</p>
                      </div>
                      <Link
                        to="/app/profile-settings?tab=security"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <Link
                        to="/app/profile-settings?tab=billing"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        Billing
                      </Link>

                      <div className="border-t border-neutral-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Jeffrey Sidebar - Always Visible */}
        <JeffreySidebar />

        {/* Main Content Area - Offset by sidebar width */}
        <main className="pt-16 pl-[300px] min-h-screen relative z-10">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </JeffreyProvider>
  );
};
