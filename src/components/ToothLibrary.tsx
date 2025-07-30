import React, { useState } from 'react';
import { Search, Filter, Plus, Download } from 'lucide-react';
import { ToothModel } from '../types';

interface ToothLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onToothSelect: (tooth: ToothModel) => void;
}

const ToothLibrary: React.FC<ToothLibraryProps> = ({ isOpen, onClose, onToothSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock tooth data - in a real app, this would come from your API
  const mockTeeth: ToothModel[] = [
    {
      id: 'tooth-1',
      name: 'Upper Central Incisor',
      category: 'incisors',
      filePath: '/models/teeth/upper-central-incisor.stl',
      thumbnailPath: '/thumbnails/upper-central-incisor.jpg',
      snapSettings: { autoSnap: true, snapDistance: 2.0 }
    },
    {
      id: 'tooth-2',
      name: 'Upper Lateral Incisor',
      category: 'incisors',
      filePath: '/models/teeth/upper-lateral-incisor.stl',
      thumbnailPath: '/thumbnails/upper-lateral-incisor.jpg',
      snapSettings: { autoSnap: true, snapDistance: 2.0 }
    },
    {
      id: 'tooth-3',
      name: 'Upper Canine',
      category: 'canines',
      filePath: '/models/teeth/upper-canine.stl',
      thumbnailPath: '/thumbnails/upper-canine.jpg',
      snapSettings: { autoSnap: true, snapDistance: 2.0 }
    },
    {
      id: 'tooth-4',
      name: 'Upper First Premolar',
      category: 'premolars',
      filePath: '/models/teeth/upper-first-premolar.stl',
      thumbnailPath: '/thumbnails/upper-first-premolar.jpg',
      snapSettings: { autoSnap: true, snapDistance: 2.0 }
    },
    {
      id: 'tooth-5',
      name: 'Upper First Molar',
      category: 'molars',
      filePath: '/models/teeth/upper-first-molar.stl',
      thumbnailPath: '/thumbnails/upper-first-molar.jpg',
      snapSettings: { autoSnap: true, snapDistance: 2.0 }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Teeth' },
    { id: 'incisors', name: 'Incisors' },
    { id: 'canines', name: 'Canines' },
    { id: 'premolars', name: 'Premolars' },
    { id: 'molars', name: 'Molars' }
  ];

  const filteredTeeth = mockTeeth.filter(tooth => {
    const matchesSearch = tooth.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tooth.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-4/5 h-4/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Tooth Library</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search teeth..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tooth Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-4 gap-6">
            {filteredTeeth.map(tooth => (
              <div
                key={tooth.id}
                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors duration-200 cursor-pointer group"
                onClick={() => onToothSelect(tooth)}
              >
                <div className="aspect-square bg-slate-600 rounded-lg mb-3 flex items-center justify-center">
                  {/* Tooth thumbnail would go here */}
                  <div className="w-16 h-16 bg-slate-500 rounded-lg flex items-center justify-center">
                    <span className="text-slate-300 text-xs">3D</span>
                  </div>
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{tooth.name}</h3>
                <p className="text-slate-400 text-xs capitalize">{tooth.category}</p>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1">
                    <Plus size={12} />
                    <span>Add to Scene</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTeeth.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64">
              <Search size={48} className="text-slate-500 mb-4" />
              <p className="text-slate-400 text-lg">No teeth found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or filter</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            {filteredTeeth.length} teeth available
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Download size={16} />
              <span>Import Custom</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToothLibrary;