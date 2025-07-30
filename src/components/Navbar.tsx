import React from 'react';
import { Save, FilePen as FileOpen, Download, Settings, User } from 'lucide-react';

const Navbar: React.FC = () => {
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
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors duration-200">
              <Settings size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors duration-200">
              <User size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;