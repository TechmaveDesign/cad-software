import React, { useState } from 'react';
import { Scissors, CircleDot, Wand2, Plus, Minus, PaintBucket, Ruler, Layers, Eye, EyeOff, Upload, ChevronDown, ChevronRight, Move3D, RotateCcw, Maximize, Brush, Pencil, Hexagon as Polygon, Spline, Settings } from 'lucide-react';
import { STLModel } from '../types';

interface SidebarProps {
  models: STLModel[];
  onModelVisibilityToggle: (id: string) => void;
  onModelColorChange: (id: string, color: string) => void;
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
}

interface TransformValues {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  models,
  onModelVisibilityToggle,
  onModelColorChange,
  activeTool,
  onToolSelect
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['models', 'edit', 'draw'])
  );
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [transformValues, setTransformValues] = useState<TransformValues>({
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 1
  });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const editTools = [
    { id: 'cut', name: 'Cut', icon: Scissors },
    { id: 'close-holes', name: 'Close Holes', icon: CircleDot },
    { id: 'smooth', name: 'Smooth', icon: Wand2 },
    { id: 'add-volume', name: 'Add Volume', icon: Plus },
    { id: 'subtract-volume', name: 'Subtract Volume', icon: Minus },
  ];

  const drawTools = [
    { id: 'mask-brush', name: 'Mask Brush', icon: PaintBucket },
    { id: 'bezier', name: 'Bezier Tool', icon: Ruler },
  ];

  const handleTransformChange = (property: keyof TransformValues, value: number) => {
    const newValues = { ...transformValues, [property]: value };
    setTransformValues(newValues);
    
    // Dispatch transform event to viewport
    if (selectedModelId) {
      window.dispatchEvent(new CustomEvent('model-transform', {
        detail: {
          modelId: selectedModelId,
          transform: newValues
        }
      }));
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    // Reset transform values when selecting a new model
    setTransformValues({
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1
    });
  };

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
              <div key={model.id} className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedModelId === model.id ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                }`} onClick={() => handleModelSelect(model.id)}>
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
                
                {/* Transform Controls for Selected Model */}
                {selectedModelId === model.id && (
                  <div className="bg-slate-600 rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Settings size={16} className="text-blue-400" />
                      <span className="text-blue-400 font-medium text-sm">Transform Controls</span>
                    </div>
                    
                    {/* Translation Controls */}
                    <div className="space-y-2">
                      <h5 className="text-slate-300 text-xs font-medium uppercase tracking-wide">Translate</h5>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">X Position</label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={transformValues.posX}
                            onChange={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-slate-500 text-xs mt-1">{transformValues.posX}</div>
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Y Position</label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={transformValues.posY}
                            onChange={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-slate-500 text-xs mt-1">{transformValues.posY}</div>
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Z Position</label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={transformValues.posZ}
                            onChange={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-slate-500 text-xs mt-1">{transformValues.posZ}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rotation Controls */}
                    <div className="space-y-2">
                      <h5 className="text-slate-300 text-xs font-medium uppercase tracking-wide">Rotate</h5>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">X Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={transformValues.rotX}
                            onChange={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-slate-500 text-xs mt-1">{transformValues.rotX}°</div>
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Y Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={transformValues.rotY}
                            onChange={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-slate-500 text-xs mt-1">{transformValues.rotY}°</div>
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Z Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={transformValues.rotZ}
                            onChange={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-slate-500 text-xs mt-1">{transformValues.rotZ}°</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Scale Control */}
                    <div className="space-y-2">
                      <h5 className="text-slate-300 text-xs font-medium uppercase tracking-wide">Scale</h5>
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Uniform Scale</label>
                        <input
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={transformValues.scale}
                          onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="text-slate-500 text-xs mt-1">{transformValues.scale}x</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors duration-200">
              <Upload size={16} />
              <span className="text-sm">Add STL Model</span>
            </button>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;