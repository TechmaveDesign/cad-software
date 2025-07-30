import React, { useState } from 'react';
import { Scissors, CircleDot, Wand2, Plus, Minus, PaintBucket, Ruler, Layers, Eye, EyeOff, Upload, ChevronDown, ChevronRight, Move3D, RotateCcw, Maximize, Brush, Pencil, Hexagon as Polygon, Spline, Settings, Eraser } from 'lucide-react';
import { STLModel } from '../types';

export interface DrawingSettings {
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  pencilSize: number;
  pencilColor: string;
  lineWidth: number;
  lineColor: string;
}

interface SidebarProps {
  models: STLModel[];
  onModelVisibilityToggle: (id: string) => void;
  onModelColorChange: (id: string, color: string) => void;
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
  drawingSettings: DrawingSettings;
  onDrawingSettingsChange: (settings: DrawingSettings) => void;
  selectedModelId: string | null;
  onModelSelect: (modelId: string | null) => void;
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
  onToolSelect,
  drawingSettings,
  onDrawingSettingsChange
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
    { id: 'move', name: 'Move', icon: Move3D, description: 'Move and rotate camera' },
    { id: 'brush', name: 'Brush', icon: Brush, description: 'Paint on model surface' },
    { id: 'pencil', name: 'Pencil', icon: Pencil, description: 'Draw thin lines' },
    { id: 'polyline', name: 'Polyline', icon: Polygon, description: 'Connected line segments' },
    { id: 'bezier', name: 'Bezier', icon: Spline, description: 'Smooth curves' },
    { id: 'eraser', name: 'Eraser', icon: Eraser, description: 'Remove drawings' }
  ];

  const handleDrawingSettingChange = (key: keyof DrawingSettings, value: number | string) => {
    const newSettings = { ...drawingSettings, [key]: value };
    onDrawingSettingsChange(newSettings);
  };

  const handleTransformChange = (property: keyof TransformValues, value: number) => {
    const newValues = { ...transformValues, [property]: value };
    setTransformValues(newValues);
    
    console.log('Slider transform change:', property, 'to value:', value, 'for model:', selectedModelId);
    
    // Dispatch transform slider event to viewport
    if (selectedModelId) {
      console.log('Dispatching transform-sliders event with values:', newValues);
      window.dispatchEvent(new CustomEvent('model-transform', {
        detail: {
          modelId: selectedModelId,
          transform: newValues
        }
      }));
    } else {
      console.log('No model selected for slider transform');
    }
  };

  const handleModelSelect = (modelId: string) => {
    console.log('Selecting model:', modelId);
    onModelSelect(modelId);
    
    // Get current transform values from the model if it exists
    const model = models.find(m => m.id === modelId);
    if (model && model.mesh) {
      const mesh = model.mesh;
      console.log('Getting current transform from mesh:', mesh.position.toArray(), mesh.rotation.toArray(), mesh.scale.toArray());
      
      setTransformValues({
        posX: Math.round(mesh.position.x * 10) / 10,
        posY: Math.round(mesh.position.y * 10) / 10,
        posZ: Math.round(mesh.position.z * 10) / 10,
        rotX: Math.round((mesh.rotation.x * 180) / Math.PI),
        rotY: Math.round((mesh.rotation.y * 180) / Math.PI),
        rotZ: Math.round((mesh.rotation.z * 180) / Math.PI),
        scale: Math.round(mesh.scale.x * 10) / 10
      });
    } else {
      // Reset transform values when selecting a new model without mesh
      setTransformValues({
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        scale: 1
      });
    }
  };

  // Update transform values when models change (e.g., when mesh is loaded)
  React.useEffect(() => {
    if (selectedModelId) {
      const model = models.find(m => m.id === selectedModelId);
      if (model && model.mesh && transformValues.posX === 0 && transformValues.posY === 0 && transformValues.posZ === 0) {
        // Only update if we haven't set values yet
        const mesh = model.mesh;
        setTransformValues({
          posX: Math.round(mesh.position.x * 10) / 10,
          posY: Math.round(mesh.position.y * 10) / 10,
          posZ: Math.round(mesh.position.z * 10) / 10,
          rotX: Math.round((mesh.rotation.x * 180) / Math.PI),
          rotY: Math.round((mesh.rotation.y * 180) / Math.PI),
          rotZ: Math.round((mesh.rotation.z * 180) / Math.PI),
          scale: Math.round(mesh.scale.x * 10) / 10
        });
      }
    }
  }, [models, selectedModelId]);

  const resetTransformValues = () => {
    const resetValues = {
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1
    };
    
    setTransformValues({
      ...resetValues
    });
    
    if (selectedModelId) {
      console.log('Resetting transform values for model:', selectedModelId);
      window.dispatchEvent(new CustomEvent('model-transform', {
        detail: {
          modelId: selectedModelId,
          transform: resetValues
        }
      }));
    }
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
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full overflow-hidden">
      {/* Models Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Models" sectionId="models" icon={Layers} />
        {expandedSections.has('models') && (
          <div className="px-4 py-4 space-y-3 max-h-96 overflow-y-auto">
            {models.map((model) => (
              <div key={model.id} className="space-y-3">
                <div>
                  <div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedModelId === model.id ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`} onClick={() => handleModelSelect(model.id)}>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onModelVisibilityToggle(model.id);
                        }}
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
                      onChange={(e) => {
                        e.stopPropagation();
                        onModelColorChange(model.id, e.target.value);
                      }}
                      className="w-6 h-6 rounded border-none cursor-pointer"
                    />
                  </div>
                
                  {/* Transform Controls for Selected Model */}
                  {selectedModelId === model.id && (
                    <div id="uiPanel" className="bg-slate-600 rounded-lg p-4 space-y-3 mt-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-blue-400 font-medium text-sm">Model Controls</span>
                        <button
                          onClick={resetTransformValues}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors duration-200"
                        >
                          Reset
                        </button>
                      </div>
                      
                      <label className="block text-slate-300 text-sm">
                        Translate X: 
                        <input 
                          type="range" 
                          id={`posX-${model.id}`}
                          min="-100" 
                          max="100" 
                          value={transformValues.posX}
                          onChange={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                          onInput={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                          className="w-full mt-1 slider"
                        />
                        <span className="text-slate-400 text-xs">{transformValues.posX}</span>
                      </label>
                      
                      <label className="block text-slate-300 text-sm">
                        Translate Y: 
                        <input 
                          type="range" 
                          id={`posY-${model.id}`}
                          min="-100" 
                          max="100" 
                          value={transformValues.posY}
                          onChange={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                          onInput={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                          className="w-full mt-1 slider"
                        />
                        <span className="text-slate-400 text-xs">{transformValues.posY}</span>
                      </label>
                      
                      <label className="block text-slate-300 text-sm">
                        Translate Z: 
                        <input 
                          type="range" 
                          id={`posZ-${model.id}`}
                          min="-100" 
                          max="100" 
                          value={transformValues.posZ}
                          onChange={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                          onInput={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                          className="w-full mt-1 slider"
                        />
                        <span className="text-slate-400 text-xs">{transformValues.posZ}</span>
                      </label>
                      
                      <label className="block text-slate-300 text-sm">
                        Rotate X: 
                        <input 
                          type="range" 
                          id={`rotX-${model.id}`}
                          min="-180" 
                          max="180" 
                          value={transformValues.rotX}
                          onChange={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                          onInput={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                          className="w-full mt-1 slider"
                        />
                        <span className="text-slate-400 text-xs">{transformValues.rotX}°</span>
                      </label>
                      
                      <label className="block text-slate-300 text-sm">
                        Rotate Y: 
                        <input 
                          type="range" 
                          id={`rotY-${model.id}`}
                          min="-180" 
                          max="180" 
                          value={transformValues.rotY}
                          onChange={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                          onInput={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                          className="w-full mt-1 slider"
                        />
                        <span className="text-slate-400 text-xs">{transformValues.rotY}°</span>
                      </label>
                      
                      <label className="block text-slate-300 text-sm">
                        Rotate Z: 
                        <input 
                          type="range" 
                          id={`rotZ-${model.id}`}
                          min="-180" 
                          max="180" 
                          value={transformValues.rotZ}
                          onChange={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                          onInput={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                          className="w-full mt-1 slider"
                        />
                        <span className="text-slate-400 text-xs">{transformValues.rotZ}°</span>
                      </label>
                      
                      <label className="block text-slate-300 text-sm">
                        Scale: 
                        <input 
                          type="range" 
                          id={`scale-${model.id}`}
                          min="0.1" 
                          max="5" 
                          step="0.1" 
                          value={transformValues.scale}
                          onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                          onInput={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                          className="w-full mt-1 slider"
                        />
                        <span className="text-slate-400 text-xs">{transformValues.scale}</span>
                      </label>
                    </div>
                  )}
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
          <div className="max-h-96 overflow-y-auto">
            {drawTools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={activeTool === tool.id}
              />
            ))}
            
            {/* Drawing Settings */}
            {activeTool && ['brush', 'pencil', 'polyline', 'bezier', 'eraser'].includes(activeTool) && (
              <div className="p-4 bg-slate-700 border-t border-slate-600">
                <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                  <Settings size={16} />
                  <span>Drawing Settings</span>
                </h4>
                
                {/* Brush Settings */}
                {(activeTool === 'brush' || activeTool === 'eraser') && (
                  <div className="space-y-3 mb-4">
                    <h5 className="text-slate-300 text-sm font-medium flex items-center space-x-1">
                      <Brush size={14} />
                      <span>Brush</span>
                    </h5>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">Size (mm)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.1"
                        value={drawingSettings.brushSize}
                        onChange={(e) => handleDrawingSettingChange('brushSize', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-slate-400 text-xs mt-1">{drawingSettings.brushSize}mm</div>
                    </div>
                    {activeTool === 'brush' && (
                      <>
                        <div>
                          <label className="block text-slate-300 text-xs mb-1">Opacity</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={drawingSettings.brushOpacity}
                            onChange={(e) => handleDrawingSettingChange('brushOpacity', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-slate-400 text-xs mt-1">{Math.round(drawingSettings.brushOpacity * 100)}%</div>
                        </div>
                        <div>
                          <label className="block text-slate-300 text-xs mb-1">Color</label>
                          <input
                            type="color"
                            value={drawingSettings.brushColor}
                            onChange={(e) => handleDrawingSettingChange('brushColor', e.target.value)}
                            className="w-full h-8 rounded border-none cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Pencil Settings */}
                {activeTool === 'pencil' && (
                  <div className="space-y-3 mb-4">
                    <h5 className="text-slate-300 text-sm font-medium flex items-center space-x-1">
                      <Pencil size={14} />
                      <span>Pencil</span>
                    </h5>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">Size (mm)</label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={drawingSettings.pencilSize}
                        onChange={(e) => handleDrawingSettingChange('pencilSize', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-slate-400 text-xs mt-1">{drawingSettings.pencilSize}mm</div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">Color</label>
                      <input
                        type="color"
                        value={drawingSettings.pencilColor}
                        onChange={(e) => handleDrawingSettingChange('pencilColor', e.target.value)}
                        className="w-full h-8 rounded border-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
                
                {/* Line Settings */}
                {(activeTool === 'polyline' || activeTool === 'bezier') && (
                  <div className="space-y-3 mb-4">
                    <h5 className="text-slate-300 text-sm font-medium flex items-center space-x-1">
                      <Spline size={14} />
                      <span>Lines</span>
                    </h5>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">Width (mm)</label>
                      <input
                        type="range"
                        min="0.2"
                        max="5"
                        step="0.1"
                        value={drawingSettings.lineWidth}
                        onChange={(e) => handleDrawingSettingChange('lineWidth', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-slate-400 text-xs mt-1">{drawingSettings.lineWidth}mm</div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">Color</label>
                      <input
                        type="color"
                        value={drawingSettings.lineColor}
                        onChange={(e) => handleDrawingSettingChange('lineColor', e.target.value)}
                        className="w-full h-8 rounded border-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="pt-3 border-t border-slate-600 flex items-center justify-between">
                  <div className="text-slate-400 text-xs">
                    Tool: {drawTools.find(t => t.id === activeTool)?.name || 'None'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded text-xs transition-colors duration-200">
                      Clear
                    </button>
                    <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors duration-200">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tool Settings */}
      {activeTool && (
        <div className="flex-1 p-4 overflow-y-auto">
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