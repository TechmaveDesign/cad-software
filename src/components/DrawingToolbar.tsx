import React, { useState } from 'react';
import { Brush, Pencil, Spline, Hexagon as Polygon, Eraser, Palette, Settings, Move3D } from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
  onSettingsChange: (settings: DrawingSettings) => void;
}

export interface DrawingSettings {
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  pencilSize: number;
  pencilColor: string;
  lineWidth: number;
  lineColor: string;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  onToolSelect,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<DrawingSettings>({
    brushSize: 2.0,
    brushOpacity: 0.8,
    brushColor: '#ff0000',
    pencilSize: 0.5,
    pencilColor: '#00ff00',
    lineWidth: 1.0,
    lineColor: '#0000ff'
  });

  const [showSettings, setShowSettings] = useState(false);

  const drawingTools = [
    { id: 'move', name: 'Move', icon: Move3D, description: 'Move and rotate camera' },
    { id: 'brush', name: 'Brush', icon: Brush, description: 'Paint on model surface' },
    { id: 'pencil', name: 'Pencil', icon: Pencil, description: 'Draw thin lines' },
    { id: 'polyline', name: 'Polyline', icon: Polygon, description: 'Connected line segments' },
    { id: 'bezier', name: 'Bezier', icon: Spline, description: 'Smooth curves' },
    { id: 'eraser', name: 'Eraser', icon: Eraser, description: 'Remove drawings' }
  ];

  const handleSettingChange = (key: keyof DrawingSettings, value: number | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const ToolButton = ({ tool }: { tool: typeof drawingTools[0] }) => (
    <button
      onClick={() => onToolSelect(tool.id)}
      className={`relative group flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
        activeTool === tool.id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
      }`}
      title={tool.description}
    >
      <tool.icon size={20} />
      <span className="text-xs mt-1 font-medium">{tool.name}</span>
      
      {/* Active indicator */}
      {activeTool === tool.id && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
      )}
    </button>
  );

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm font-medium mr-4">Drawing Tools:</span>
          {drawingTools.map(tool => (
            <ToolButton key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
            showSettings
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Settings size={16} />
          <span className="text-sm">Settings</span>
        </button>
      </div>

      {/* Tool Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-slate-700 rounded-lg">
          <div className="grid grid-cols-3 gap-6">
            {/* Brush Settings */}
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Brush size={16} />
                <span>Brush</span>
              </h4>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Size (mm)</label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={settings.brushSize}
                  onChange={(e) => handleSettingChange('brushSize', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-slate-400 text-xs mt-1">{settings.brushSize}mm</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.brushOpacity}
                  onChange={(e) => handleSettingChange('brushOpacity', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-slate-400 text-xs mt-1">{Math.round(settings.brushOpacity * 100)}%</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.brushColor}
                  onChange={(e) => handleSettingChange('brushColor', e.target.value)}
                  className="w-full h-8 rounded border-none cursor-pointer"
                />
              </div>
            </div>

            {/* Pencil Settings */}
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Pencil size={16} />
                <span>Pencil</span>
              </h4>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Size (mm)</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={settings.pencilSize}
                  onChange={(e) => handleSettingChange('pencilSize', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-slate-400 text-xs mt-1">{settings.pencilSize}mm</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.pencilColor}
                  onChange={(e) => handleSettingChange('pencilColor', e.target.value)}
                  className="w-full h-8 rounded border-none cursor-pointer"
                />
              </div>
            </div>

            {/* Line Settings */}
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Spline size={16} />
                <span>Lines</span>
              </h4>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Width (mm)</label>
                <input
                  type="range"
                  min="0.2"
                  max="5"
                  step="0.1"
                  value={settings.lineWidth}
                  onChange={(e) => handleSettingChange('lineWidth', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-slate-400 text-xs mt-1">{settings.lineWidth}mm</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.lineColor}
                  onChange={(e) => handleSettingChange('lineColor', e.target.value)}
                  className="w-full h-8 rounded border-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-slate-600 flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Active Tool: {activeTool ? drawingTools.find(t => t.id === activeTool)?.name || 'None' : 'None'}
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded text-sm transition-colors duration-200">
                Clear All
              </button>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors duration-200">
                Save Drawing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingToolbar;