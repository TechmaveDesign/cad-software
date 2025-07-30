import React, { useState } from 'react';
import { 
  Scissors, 
  CircleDot, 
  Wand2, 
  Plus, 
  Minus, 
  PaintBucket, 
  Ruler, 
  Layers,
  Eye,
  EyeOff,
  Upload,
  ChevronDown,
  ChevronRight,
  Move3D,
  RotateCcw,
  Maximize,
  Brush,
  Pencil,
  Polygon,
  Spline
} from 'lucide-react';
import { STLModel } from '../types';

interface SidebarProps {
  models: STLModel[];
  onModelVisibilityToggle: (id: string) => void;
  onModelColorChange: (id: string, color: string) => void;
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  models,
  onModelVisibilityToggle,
  onModelColorChange,
  activeTool,
  onToolSelect
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['models', 'transform', 'edit', 'draw'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const transformTools = [
    { id: 'translate', name: 'Translate', icon: Move3D },
    { id: 'rotate', name: 'Rotate', icon: RotateCcw },
    { id: 'scale', name: 'Scale', icon: Maximize },
  ];

  const editTools = [
    { id: 'cut', name: 'Cut', icon: Scissors },
    { id: 'close-holes', name: 'Close Holes', icon: CircleDot },
    { id: 'smooth', name: 'Smooth', icon: Wand2 },
    { id: 'add-volume', name: 'Add Volume', icon: Plus },
    { id: 'subtract-volume', name: 'Subtract Volume', icon: Minus },
  ];

  const drawTools = [
    { id: 'mask-brush', name: 'Mask Brush', icon: Brush },
    { id: 'pencil', name: 'Pencil Tool', icon: Pencil },
    { id: 'polyline', name: 'Polyline/Polygon', icon: Polygon },
    { id: 'bezier', name: 'Bezier Curve', icon: Spline },
  ];

  const SectionHeader = ({ 
    title, 
    sectionId, 
    icon: Icon 
  }: { 
    title: string; 
    sectionId: string; 
    icon: React.ComponentType<any> 
  }) => (
    <button
      onClick={() => toggleSection(sectionId)}
      className="w-full flex items-center justify-between p-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200"
    >
      <div className="flex items-center space-x-2">
        <Icon size={18} />
        <span className="font-medium">{title}</span>
      </div>
      {expandedSections.has(sectionId) ? 
        <ChevronDown size={16} /> : 
        <ChevronRight size={16} />
      }
    </button>
  );

  const ToolButton = ({ 
    tool, 
    isActive 
  }: { 
    tool: { id: string; name: string; icon: React.ComponentType<any> }; 
    isActive: boolean 
  }) => (
    <button
      onClick={() => onToolSelect(tool.id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      <tool.icon size={16} />
      <span>{tool.name}</span>
    </button>
  );

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Models Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Models" sectionId="models" icon={Layers} />
        {expandedSections.has('models') && (
          <div className="px-4 py-4 space-y-3">
            {models.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onModelVisibilityToggle(model.id)}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {model.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <span className="text-slate-300 text-sm font-medium">
                    {model.name}
                  </span>
                </div>
                <input
                  type="color"
                  value={model.color}
                  onChange={(e) => onModelColorChange(model.id, e.target.value)}
                  className="w-6 h-6 rounded border-none cursor-pointer"
                />
              </div>
            ))}
            <button className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors duration-200">
              <Upload size={16} />
              <span className="text-sm">Add STL Model</span>
            </button>
          </div>
        )}
      </div>

      {/* Transform Tools Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Transform Tools" sectionId="transform" icon={Move3D} />
        {expandedSections.has('transform') && (
          <div>
            {transformTools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={activeTool === tool.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Tools Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Edit Tools" sectionId="edit" icon={Scissors} />
        {expandedSections.has('edit') && (
          <div>
            {editTools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={activeTool === tool.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Draw Tools Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Draw Tools" sectionId="draw" icon={PaintBucket} />
        {expandedSections.has('draw') && (
          <div>
            {drawTools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={activeTool === tool.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tool Settings */}
      {activeTool && (
        <div className="flex-1 p-4">
          <h3 className="text-slate-300 font-medium mb-4">Tool Settings</h3>
          <div className="space-y-4">
            {/* Transform Tool Settings */}
            {(activeTool === 'translate' || activeTool === 'rotate' || activeTool === 'scale') && (
              <>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Snap to Grid</label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Step Size</label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    defaultValue="1"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">1.0 units</div>
                </div>
              </>
            )}
            
            {/* Drawing Tool Settings */}
            {(activeTool === 'mask-brush' || activeTool === 'pencil') && (
              <>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Brush Size</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    defaultValue="10"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">10px</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    defaultValue="0.8"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">80%</div>
                </div>
                {activeTool === 'mask-brush' && (
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Mask Color</label>
                    <input
                      type="color"
                      defaultValue="#ff0000"
                      className="w-full h-8 rounded border-none cursor-pointer"
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Polyline/Polygon Settings */}
            {activeTool === 'polyline' && (
              <>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Line Width</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    defaultValue="2"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">2px</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Auto Close Polygon</label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Line Color</label>
                  <input
                    type="color"
                    defaultValue="#00ff00"
                    className="w-full h-8 rounded border-none cursor-pointer"
                  />
                </div>
              </>
            )}
            
            {/* Bezier Settings */}
            {activeTool === 'bezier' && (
              <>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Curve Smoothness</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    defaultValue="1"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">1.0</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Show Control Points</label>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </>
            )}
            
            {/* General Edit Tool Settings */}
            {(activeTool === 'cut' || activeTool === 'smooth' || activeTool === 'add-volume' || activeTool === 'subtract-volume') && (
              <>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Spacer (mm)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="0.05"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">0.05mm</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Thickness (mm)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    defaultValue="1.75"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">1.75mm</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Taper Angle (°)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    defaultValue="0"
                    className="w-full"
                  />
                  <div className="text-slate-500 text-xs mt-1">0°</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;