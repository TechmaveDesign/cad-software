import React, { useState, useRef, useEffect } from 'react';
import { Brush, Pencil, Spline, Hexagon as Polygon, Eraser, Palette, Settings, Move3D, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Handle click outside to close settings panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings && 
          settingsPanelRef.current && 
          toolbarRef.current &&
          !settingsPanelRef.current.contains(event.target as Node) &&
          !toolbarRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

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

  const handleSaveDrawing = () => {
    console.log('Drawing saved with settings:', settings);
    setShowSettings(false); // Close settings panel after saving
    // TODO: Implement actual save functionality
  };

  const handleClearAll = () => {
    console.log('Clearing all drawings');
    // TODO: Implement clear functionality
  };

  const ToolButton = ({ tool }: { tool: typeof drawingTools[0] }) => (
    <button
      onClick={() => onToolSelect(tool.id)}
      className={`relative group flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
        activeTool === tool.id
          ? 'bg-blue-600 text-white shadow-md scale-105'
          : 'bg-slate-700/90 text-slate-300 hover:bg-slate-600 hover:text-white shadow-sm'
      }`}
      title={tool.description}
    >
      <tool.icon size={18} />
      <span className="text-xs font-medium hidden group-hover:block absolute -left-16 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">
        {tool.name}
      </span>
      
      {/* Active indicator */}
      {activeTool === tool.id && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full border border-slate-800"></div>
      )}
    </button>
  );

  return (
    <div ref={toolbarRef} className="flex items-center z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="bg-slate-800/95 backdrop-blur-sm rounded-l-lg shadow-lg border border-slate-600 border-r-0 p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-300"
        title={isMinimized ? "Show Tools" : "Hide Tools"}
      >
        {isMinimized ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Main Toolbar */}
      <div className={`bg-slate-800/95 backdrop-blur-sm rounded-r-lg shadow-lg border border-slate-600 transition-all duration-300 ${
        isMinimized ? 'w-0 overflow-hidden border-l-0' : 'p-2'
      }`}>
        {!isMinimized && (
          <div className="flex flex-col items-center justify-center">
            {/* Drawing Tools - Vertical Layout */}
            <div className="flex flex-col items-center space-y-2">
              {drawingTools.map(tool => (
                <ToolButton key={tool.id} tool={tool} />
              ))}

              {/* Settings Toggle */}
              <div className="w-6 h-px bg-slate-600 my-1"></div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`relative group flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  showSettings
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-slate-700/90 text-slate-300 hover:bg-slate-600 hover:text-white shadow-sm'
                }`}
                title="Tool Settings"
              >
                <Settings size={18} />
                <span className="text-xs font-medium hidden group-hover:block absolute -left-16 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">
                  Settings
                </span>
                {showSettings && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full border border-slate-800"></div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tool Settings Panel */}
      {showSettings && !isMinimized && (
        <div 
          ref={settingsPanelRef}
          className={`absolute right-full top-1/2 transform -translate-y-1/2 mr-3 p-4 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 min-w-[500px] transition-all duration-500 ease-out ${
            showSettings 
              ? 'opacity-100 scale-100 translate-x-0' 
              : 'opacity-0 scale-95 translate-x-4'
          }`}
          style={{
            transformOrigin: 'right center',
            animation: showSettings ? 'slideLeftFade 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideRightFade 0.3s cubic-bezier(0.4, 0, 1, 1)'
          }}
        >
          <div className="grid grid-cols-3 gap-4">
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
                  className="w-full h-2 accent-blue-600"
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
                  className="w-full h-2 accent-blue-600"
                />
                <div className="text-slate-400 text-xs mt-1">{Math.round(settings.brushOpacity * 100)}%</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.brushColor}
                  onChange={(e) => handleSettingChange('brushColor', e.target.value)}
                  className="w-full h-8 rounded-md border border-slate-600 cursor-pointer bg-slate-700"
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
                  className="w-full h-2 accent-blue-600"
                />
                <div className="text-slate-400 text-xs mt-1">{settings.pencilSize}mm</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.pencilColor}
                  onChange={(e) => handleSettingChange('pencilColor', e.target.value)}
                  className="w-full h-8 rounded-md border border-slate-600 cursor-pointer bg-slate-700"
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
                  className="w-full h-2 accent-blue-600"
                />
                <div className="text-slate-400 text-xs mt-1">{settings.lineWidth}mm</div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={settings.lineColor}
                  onChange={(e) => handleSettingChange('lineColor', e.target.value)}
                  className="w-full h-8 rounded-md border border-slate-600 cursor-pointer bg-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t border-slate-600 flex items-center justify-between">
            <div className="text-slate-300 text-sm">
              Active Tool: {activeTool ? drawingTools.find(t => t.id === activeTool)?.name || 'None' : 'None'}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-md text-sm transition-colors duration-200"
              >
                Clear All
              </button>
              <button 
                onClick={handleSaveDrawing}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors duration-200"
              >
                Save Drawing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideLeftFade {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }

        @keyframes slideRightFade {
          0% {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50%) translateX(20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};

export default DrawingToolbar;