import React from 'react';
import { Brush, Pencil, Polygon, Spline, Eraser, Palette, Settings } from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushOpacity: number;
  onBrushOpacityChange: (opacity: number) => void;
  drawingColor: string;
  onDrawingColorChange: (color: string) => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  onToolSelect,
  brushSize,
  onBrushSizeChange,
  brushOpacity,
  onBrushOpacityChange,
  drawingColor,
  onDrawingColorChange
}) => {
  const drawingTools = [
    { id: 'pencil', name: 'Pencil', icon: Pencil, description: 'Draw thin lines on surface' },
    { id: 'mask-brush', name: 'Mask Brush', icon: Brush, description: 'Paint mask areas' },
    { id: 'polygon', name: 'Polygon', icon: Polygon, description: 'Create polygon shapes' },
    { id: 'bezier', name: 'Bezier', icon: Spline, description: 'Draw smooth curves' },
    { id: 'eraser', name: 'Eraser', icon: Eraser, description: 'Remove annotations' }
  ];

  const isDrawingTool = (toolId: string) => {
    return ['pencil', 'mask-brush', 'polygon', 'bezier', 'eraser'].includes(toolId);
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm font-medium mr-4">Drawing Tools:</span>
          {drawingTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTool === tool.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
              title={tool.description}
            >
              <tool.icon size={16} />
              <span className="text-sm">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Tool Settings */}
        {activeTool && isDrawingTool(activeTool) && (
          <div className="flex items-center space-x-6">
            {/* Color Picker */}
            <div className="flex items-center space-x-2">
              <Palette size={16} className="text-slate-400" />
              <input
                type="color"
                value={drawingColor}
                onChange={(e) => onDrawingColorChange(e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer"
                title="Drawing Color"
              />
            </div>

            {/* Brush Size */}
            {(activeTool === 'mask-brush' || activeTool === 'pencil' || activeTool === 'eraser') && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-sm">Size:</span>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={brushSize}
                  onChange={(e) => onBrushSizeChange(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-slate-300 text-xs w-8">{brushSize.toFixed(1)}</span>
              </div>
            )}

            {/* Opacity */}
            {activeTool === 'mask-brush' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-sm">Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={brushOpacity}
                  onChange={(e) => onBrushOpacityChange(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-slate-300 text-xs w-8">{Math.round(brushOpacity * 100)}%</span>
              </div>
            )}

            {/* Tool Info */}
            <div className="text-slate-400 text-sm">
              {activeTool === 'pencil' && 'Click and drag to draw thin lines'}
              {activeTool === 'mask-brush' && 'Click and drag to paint mask areas'}
              {activeTool === 'polygon' && 'Click to place points, double-click to finish'}
              {activeTool === 'bezier' && 'Click to place control points for curves'}
              {activeTool === 'eraser' && 'Click and drag to remove annotations'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingToolbar;