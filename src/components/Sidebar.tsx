import React, { useState } from 'react';
import { 
  Layers,
  Eye,
  EyeOff,
  Upload,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
import { STLModel } from '../types';
import EditingTools from './EditingTools';
import TransformControls, { TransformOperation } from './TransformControls';

interface SidebarProps {
  models: STLModel[];
  onModelVisibilityToggle: (id: string) => void;
  onModelColorChange: (id: string, color: string) => void;
  onModelSelect: (id: string) => void;
  selectedModel: string | null;
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
  onToolDeselect: () => void;
  onTransform: (modelId: string, transform: TransformOperation) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  models,
  onModelVisibilityToggle,
  onModelColorChange,
  onModelSelect,
  selectedModel,
  activeTool,
  onToolSelect,
  onToolDeselect,
  onTransform
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['models', 'tools'])
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

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Models Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Models" sectionId="models" icon={Layers} />
        {expandedSections.has('models') && (
          <div className="px-4 py-4 space-y-3">
            {models.map((model) => (
              <div 
                key={model.id} 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedModel === model.id ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                onClick={() => onModelSelect(model.id)}
              >
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
                  onClick={(e) => e.stopPropagation()}
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

      {/* Tools Section */}
      <div className="border-b border-slate-700">
        <SectionHeader title="Tools" sectionId="tools" icon={Settings} />
        {expandedSections.has('tools') && (
          <EditingTools
            activeTool={activeTool}
            onToolSelect={onToolSelect}
            onToolDeselect={onToolDeselect}
          />
        )}
      </div>

      {/* Transform Controls */}
      {(['move', 'rotate', 'scale'].includes(activeTool || '')) && (
        <div className="flex-1 bg-slate-750">
          <TransformControls
            selectedModel={selectedModel}
            onTransform={onTransform}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;