import React from 'react';
import { Save, FilePen as FileOpen, Download, Settings, User, ChevronDown, LogOut } from 'lucide-react';

interface NavbarProps {
  onProfileClick: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onProfileClick, onLogout }) => {
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  
  // Mock user data - in a real app, this would come from your auth system
  const user = {
    name: 'Dr. John Smith',
    email: 'john.smith@dentalclinic.com',
    avatar: null // Could be a URL to user's profile picture
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');
    
    // Call the logout handler from App component
    onLogout();
    setShowProfileDropdown(false);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">3D</span>
            </div>
            <span className="text-white font-semibold text-lg">DentalCAD Pro</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors duration-200 flex items-center space-x-2">
              <FileOpen size={16} />
              <span className="text-sm">Open</span>
            </button>
            <button className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors duration-200 flex items-center space-x-2">
              <Save size={16} />
              <span className="text-sm">Save</span>
            </button>
            <button className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors duration-200 flex items-center space-x-2">
              <Download size={16} />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-slate-400 text-sm">
            Project: Untitled
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors duration-200">
              <Settings size={18} />
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full" />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-slate-400 text-sm">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        onProfileClick();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200"
                    >
                      <User size={16} />
                      <span>Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors duration-200"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;