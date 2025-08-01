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
    { id: 'move', name: 'Move', icon: Move3D, description: 'Move and rotate camera', cursor: 'grab' },
    { id: 'brush', name: 'Brush', icon: Brush, description: 'Paint on model surface', cursor: 'crosshair' },
    { id: 'pencil', name: 'Pencil', icon: Pencil, description: 'Draw thin lines', cursor: 'crosshair' },
    { id: 'polyline', name: 'Polyline', icon: Polygon, description: 'Connected line segments', cursor: 'crosshair' },
    { id: 'bezier', name: 'Bezier', icon: Spline, description: 'Smooth curves', cursor: 'crosshair' },
    { id: 'mask-brush', name: 'Mask', icon: Palette, description: 'Create mask areas', cursor: 'crosshair' },
    { id: 'eraser', name: 'Eraser', icon: Eraser, description: 'Remove drawings', cursor: 'crosshair' }
  ];

  const handleSettingChange = (key: keyof DrawingSettings, value: number | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    console.log('DrawingToolbar: Settings changed:', key, '=', value);
  };

  const ToolButton = ({ tool }: { tool: typeof drawingTools[0] }) => (
    <button
      onClick={() => onToolSelect(tool.id)}
      className={`relative group flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
        activeTool === tool.id
          ? 'bg-blue-600 text-white shadow-lg scale-110'
          : 'bg-slate-700/90 text-slate-300 hover:bg-slate-600 hover:text-white shadow-md'
      }`}
      title={tool.description}
    >
      <tool.icon size={24} />
      <span className="text-xs mt-1 font-medium hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">
        {tool.name}
      </span>
      
      {/* Active indicator */}
      {activeTool === tool.id && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-800"></div>
      )}
    </button>
  );

  return (
    <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600 p-3">
      <div className="flex items-center justify-center">
        {/* Drawing Tools - Horizontal Layout */}
        <div className="flex items-center space-x-3">
          {drawingTools.map(tool => (
            <ToolButton key={tool.id} tool={tool} />
          ))}

          {/* Settings Toggle */}
          <div className="w-px h-8 bg-gray-300 mx-2"></div>
          <div className="w-px h-8 bg-slate-600 mx-2"></div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`relative group flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              showSettings
                ? 'bg-blue-600 text-white shadow-lg scale-110'
                : 'bg-slate-700/90 text-slate-300 hover:bg-slate-600 hover:text-white shadow-md'
            }`}
            title="Tool Settings"
          >
            <Settings size={24} />
            <span className="text-xs mt-1 font-medium hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">
              Settings
            </span>
            {showSettings && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-800"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tool Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 p-6 bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600 min-w-[600px]">
          <div className="grid grid-cols-3 gap-6">
            {/* Brush Settings */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold flex items-center space-x-2">
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
                  className="w-full accent-blue-600"
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
                  className="w-full accent-blue-600"
                />
                <div className="text-slate-400 text-xs mt-1">{Math.round(settings.brushOpacity * 100)}%</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.brushColor}
                  onChange={(e) => handleSettingChange('brushColor', e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-600 cursor-pointer bg-slate-700"
                />
              </div>
            </div>

            {/* Pencil Settings */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold flex items-center space-x-2">
                <Pencil size={16} />
                <span>Pencil</span>
              </h4>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Size (mm)</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={settings.pencilSize}
                  onChange={(e) => handleSettingChange('pencilSize', parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-slate-400 text-xs mt-1">{settings.pencilSize}mm</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.pencilColor}
                  onChange={(e) => handleSettingChange('pencilColor', e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-600 cursor-pointer bg-slate-700"
                />
              </div>
            </div>

            {/* Line Settings */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold flex items-center space-x-2">
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
                  className="w-full accent-blue-600"
                />
                <div className="text-slate-400 text-xs mt-1">{settings.lineWidth}mm</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.lineColor}
                  onChange={(e) => handleSettingChange('lineColor', e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-600 cursor-pointer bg-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-slate-600 flex items-center justify-between">
            <div className="text-slate-300 text-sm">
              Active Tool: {activeTool ? drawingTools.find(t => t.id === activeTool)?.name || 'None' : 'None'}
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors duration-200">
                Clear All
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200">
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