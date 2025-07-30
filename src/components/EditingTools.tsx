import React, { useState } from 'react';
import { Scissors, CircleDot, Wand2, Plus, Minus, PaintBucket, Pencil, Hexagon as Polygon, Beer as Bezier, Eraser, Type, Move3D, RotateCw, Maximize2 } from 'lucide-react';

export interface EditingTool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: 'mesh' | 'draw' | 'text' | 'transform';
  lockModel?: boolean;
}

interface EditingToolsProps {
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
  onToolDeselect: () => void;
}

const EditingTools: React.FC<EditingToolsProps> = ({
  activeTool,
  onToolSelect,
  onToolDeselect
}) => {
  const [toolSettings, setToolSettings] = useState({
    brushRadius: 5,
    brushOpacity: 0.8,
    smoothStrength: 0.5,
    textSize: 12,
    textDepth: 2,
    textFont: 'Arial'
  });

  const meshTools: EditingTool[] = [
    { id: 'cut', name: 'Cut Tool', icon: Scissors, category: 'mesh', lockModel: true },
    { id: 'close-holes', name: 'Close Holes', icon: CircleDot, category: 'mesh' },
    { id: 'smooth', name: 'Smooth', icon: Wand2, category: 'mesh' },
    { id: 'add-volume', name: 'Add Volume', icon: Plus, category: 'mesh', lockModel: true },
    { id: 'subtract-volume', name: 'Subtract Volume', icon: Minus, category: 'mesh', lockModel: true },
  ];

  const drawTools: EditingTool[] = [
    { id: 'mask-brush', name: 'Mask Brush', icon: PaintBucket, category: 'draw', lockModel: true },
    { id: 'pencil', name: 'Pencil', icon: Pencil, category: 'draw', lockModel: true },
    { id: 'polyline', name: 'Polyline', icon: Polygon, category: 'draw', lockModel: true },
    { id: 'bezier', name: 'Bezier', icon: Bezier, category: 'draw', lockModel: true },
    { id: 'eraser', name: 'Eraser', icon: Eraser, category: 'draw', lockModel: true },
  ];

  const textTools: EditingTool[] = [
    { id: 'text-emboss', name: 'Text Emboss', icon: Type, category: 'text', lockModel: true },
    { id: 'text-deboss', name: 'Text Deboss', icon: Type, category: 'text', lockModel: true },
  ];

  const transformTools: EditingTool[] = [
    { id: 'move', name: 'Move', icon: Move3D, category: 'transform' },
    { id: 'rotate', name: 'Rotate', icon: RotateCw, category: 'transform' },
    { id: 'scale', name: 'Scale', icon: Maximize2, category: 'transform' },
  ];

  const ToolButton = ({ 
    tool, 
    isActive 
  }: { 
    tool: EditingTool; 
    isActive: boolean 
  }) => (
    <button
      onClick={() => isActive ? onToolDeselect() : onToolSelect(tool.id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
      title={tool.name}
    >
      <tool.icon size={16} />
      <span>{tool.name}</span>
      {tool.lockModel && (
        <span className="ml-auto text-xs bg-orange-600 px-1 rounded">LOCK</span>
      )}
    </button>
  );

  const ToolSection = ({ 
    title, 
    tools 
  }: { 
    title: string; 
    tools: EditingTool[] 
  }) => (
    <div className="border-b border-slate-700">
      <div className="px-4 py-3 bg-slate-750">
        <h3 className="text-slate-300 font-medium text-sm">{title}</h3>
      </div>
      <div>
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
          />
        ))}
      </div>
    </div>
  );

  const renderToolSettings = () => {
    if (!activeTool) return null;

    switch (activeTool) {
      case 'mask-brush':
      case 'pencil':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Brush Radius</label>
              <input
                type="range"
                min="1"
                max="20"
                value={toolSettings.brushRadius}
                onChange={(e) => setToolSettings(prev => ({ 
                  ...prev, 
                  brushRadius: parseInt(e.target.value) 
                }))}
                className="w-full"
              />
              <div className="text-slate-500 text-xs mt-1">{toolSettings.brushRadius}px</div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Opacity</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={toolSettings.brushOpacity}
                onChange={(e) => setToolSettings(prev => ({ 
                  ...prev, 
                  brushOpacity: parseFloat(e.target.value) 
                }))}
                className="w-full"
              />
              <div className="text-slate-500 text-xs mt-1">{Math.round(toolSettings.brushOpacity * 100)}%</div>
            </div>
          </div>
        );

      case 'smooth':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Smooth Strength</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={toolSettings.smoothStrength}
                onChange={(e) => setToolSettings(prev => ({ 
                  ...prev, 
                  smoothStrength: parseFloat(e.target.value) 
                }))}
                className="w-full"
              />
              <div className="text-slate-500 text-xs mt-1">{Math.round(toolSettings.smoothStrength * 100)}%</div>
            </div>
          </div>
        );

      case 'text-emboss':
      case 'text-deboss':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Text Content</label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Font</label>
              <select 
                value={toolSettings.textFont}
                onChange={(e) => setToolSettings(prev => ({ 
                  ...prev, 
                  textFont: e.target.value 
                }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Size</label>
              <input
                type="range"
                min="6"
                max="48"
                value={toolSettings.textSize}
                onChange={(e) => setToolSettings(prev => ({ 
                  ...prev, 
                  textSize: parseInt(e.target.value) 
                }))}
                className="w-full"
              />
              <div className="text-slate-500 text-xs mt-1">{toolSettings.textSize}pt</div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Depth</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={toolSettings.textDepth}
                onChange={(e) => setToolSettings(prev => ({ 
                  ...prev, 
                  textDepth: parseFloat(e.target.value) 
                }))}
                className="w-full"
              />
              <div className="text-slate-500 text-xs mt-1">{toolSettings.textDepth}mm</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-slate-500 text-sm">
            No settings available for this tool.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ToolSection title="🧰 Mesh Editing" tools={meshTools} />
      <ToolSection title="✍️ Draw Tools" tools={drawTools} />
      <ToolSection title="🔤 Text Tools" tools={textTools} />
      <ToolSection title="🔧 Transform" tools={transformTools} />
      
      {activeTool && (
        <div className="flex-1 p-4 bg-slate-750">
          <h3 className="text-slate-300 font-medium mb-4">Tool Settings</h3>
          {renderToolSettings()}
        </div>
      )}
    </div>
  );
};

export default EditingTools;