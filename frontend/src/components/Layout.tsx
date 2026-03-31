import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiPlus, FiLogOut } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
  user: any;
  signOut: (() => void) | undefined;
}

export default function Layout({ children, user, signOut }: LayoutProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.png" alt="AI PoC & Demo Registry" className="h-10" />
              </Link>
              <div className="hidden sm:flex space-x-1">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                    isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiGrid size={16} />
                  <span>Demos</span>
                </Link>
                <Link
                  to="/demos/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                    isActive('/demos/new') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiPlus size={16} />
                  <span>New Demo</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.signInDetails?.loginId}</span>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <FiLogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
