import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors, CircleDot, Wand2, Plus, Minus, PaintBucket,
  Layers, Eye, EyeOff, Upload, ChevronDown, ChevronRight,
  Move3D, Brush, Pencil, Hexagon as Polygon, Spline,
  Settings, Eraser
} from 'lucide-react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
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
  setModels: (models: STLModel[]) => void;
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
  setModels,
  onModelVisibilityToggle,
  onModelColorChange,
  activeTool,
  onToolSelect,
  drawingSettings,
  onDrawingSettingsChange,
  selectedModelId,
  onModelSelect
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['models', 'edit', 'draw']));
  const [transformValues, setTransformValues] = useState<TransformValues>({
    posX: 0, posY: 0, posZ: 0,
    rotX: 0, rotY: 0, rotZ: 0,
    scale: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    newExpanded.has(section) ? newExpanded.delete(section) : newExpanded.add(section);
    setExpandedSections(newExpanded);
  };

  const handleDrawingSettingChange = (key: keyof DrawingSettings, value: number | string) => {
    const newSettings = { ...drawingSettings, [key]: value };
    onDrawingSettingsChange(newSettings);
  };

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    const model = models.find(m => m.id === modelId);
    if (model && model.mesh) {
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
  };

  const handleTransformChange = (property: keyof TransformValues, value: number) => {
    const newValues = { ...transformValues, [property]: value };
    setTransformValues(newValues);
    if (selectedModelId) {
      window.dispatchEvent(new CustomEvent('transform-sliders', {
        detail: {
          modelId: selectedModelId,
          transform: newValues
        }
      }));
    }
  };

  const resetTransformValues = () => {
    const resetValues = {
      posX: 0, posY: 0, posZ: 0,
      rotX: 0, rotY: 0, rotZ: 0,
      scale: 1
    };
    setTransformValues(resetValues);
    if (selectedModelId) {
      window.dispatchEvent(new CustomEvent('transform-sliders', {
        detail: {
          modelId: selectedModelId,
          transform: resetValues
        }
      }));
    }
  };

  const handleSTLUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const contents = event.target?.result;
      if (!contents || typeof contents === 'string') return;

      const loader = new STLLoader();
      const geometry = loader.parse(contents as ArrayBuffer);
      const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = file.name;

      const id = uuidv4();
      const newModel: STLModel = {
        id,
        name: file.name,
        mesh,
        visible: true,
        color: '#999999'
      };

      const updatedModels = [...models, newModel];
      setModels(updatedModels);
      onModelSelect(id);

      const initialTransform = {
        posX: 0, posY: 0, posZ: 0,
        rotX: 0, rotY: 0, rotZ: 0,
        scale: 1
      };

      window.dispatchEvent(new CustomEvent('transform-sliders', {
        detail: {
          modelId: id,
          transform: initialTransform
        }
      }));
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (selectedModelId) {
      const model = models.find(m => m.id === selectedModelId);
      if (model && model.mesh) {
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

  const fileInputTrigger = () => fileInputRef.current?.click();

  const editTools = [
    { id: 'cut', name: 'Cut', icon: Scissors },
    { id: 'close-holes', name: 'Close Holes', icon: CircleDot },
    { id: 'smooth', name: 'Smooth', icon: Wand2 },
    { id: 'add-volume', name: 'Add Volume', icon: Plus },
    { id: 'subtract-volume', name: 'Subtract Volume', icon: Minus },
  ];

  const drawTools = [
    { id: 'move', name: 'Move', icon: Move3D },
    { id: 'brush', name: 'Brush', icon: Brush },
    { id: 'pencil', name: 'Pencil', icon: Pencil },
    { id: 'polyline', name: 'Polyline', icon: Polygon },
    { id: 'bezier', name: 'Bezier', icon: Spline },
    { id: 'eraser', name: 'Eraser', icon: Eraser }
  ];

  const ToolButton = ({ tool, isActive }: { tool: { id: string; name: string; icon: React.ComponentType<any> }; isActive: boolean }) => (
    <button
      onClick={() => onToolSelect(tool.id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors duration-200 ${
        isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      <tool.icon size={16} />
      <span>{tool.name}</span>
    </button>
  );

  const SectionHeader = ({ title, sectionId, icon: Icon }: { title: string; sectionId: string; icon: React.ComponentType<any> }) => (
    <button
      onClick={() => toggleSection(sectionId)}
      className="w-full flex items-center justify-between p-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200"
    >
      <div className="flex items-center space-x-2">
        <Icon size={18} />
        <span className="font-medium">{title}</span>
      </div>
      {expandedSections.has(sectionId) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
  );

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full overflow-hidden">
      {/* Upload Hidden Input */}
      <input type="file" accept=".stl" ref={fileInputRef} onChange={handleSTLUpload} hidden />

      {/* Models Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Models" sectionId="models" icon={Layers} />
        {expandedSections.has('models') && (
          <div className="px-4 py-4 space-y-3 max-h-96 overflow-y-auto">
            {models.map((model) => (
              <div key={model.id} className="space-y-3">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedModelId === model.id ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => handleModelSelect(model.id)}
                >
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
                    <span className="text-slate-300 text-sm font-medium">{model.name}</span>
                  </div>
                  <input
                    type="color"
                    value={model.color}
                    onChange={(e) => onModelColorChange(model.id, e.target.value)}
                    className="w-6 h-6 rounded border-none cursor-pointer"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={fileInputTrigger}
              className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors duration-200"
            >
              <Upload size={16} />
              <span className="text-sm">Add STL Model</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Tools */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Edit Tools" sectionId="edit" icon={Scissors} />
        {expandedSections.has('edit') && (
          <div>
            {editTools.map((tool) => (
              <ToolButton key={tool.id} tool={tool} isActive={activeTool === tool.id} />
            ))}
          </div>
        )}
      </div>

      {/* Draw Tools */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Draw Tools" sectionId="draw" icon={PaintBucket} />
        {expandedSections.has('draw') && (
          <div className="max-h-96 overflow-y-auto">
            {drawTools.map((tool) => (
              <ToolButton key={tool.id} tool={tool} isActive={activeTool === tool.id} />
            ))}
            {/* You can add drawing settings UI here as before if needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
