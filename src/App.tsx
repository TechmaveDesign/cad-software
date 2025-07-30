import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Viewport3D from './components/Viewport3D';
import ToothLibrary from './components/ToothLibrary';
import { STLModel, ToothModel } from './types';
import { TransformOperation } from './components/TransformControls';

function App() {
  const [models, setModels] = useState<STLModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isToothLibraryOpen, setIsToothLibraryOpen] = useState(false);

  const handleModelVisibilityToggle = (id: string) => {
    setModels(prevModels =>
      prevModels.map(model =>
        model.id === id ? { ...model, visible: !model.visible } : model
      )
    );
  };

  const handleModelColorChange = (id: string, color: string) => {
    setModels(prevModels =>
      prevModels.map(model =>
        model.id === id ? { ...model, color } : model
      )
    );
  };

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    
    // Open tooth library for specific tools
    if (toolId === 'add-volume') {
      setIsToothLibraryOpen(true);
    }
  };

  const handleToolDeselect = () => {
    setActiveTool(null);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(selectedModel === modelId ? null : modelId);
  };

  const handleTransform = (modelId: string, transform: TransformOperation) => {
    setModels(prevModels =>
      prevModels.map(model => {
        if (model.id !== modelId || !model.mesh) return model;
        
        const mesh = model.mesh;
        
        switch (transform.type) {
          case 'move':
            if (transform.axis && transform.value !== undefined) {
              mesh.position[transform.axis] += transform.value;
            }
            break;
          case 'rotate':
            if (transform.axis && transform.value !== undefined) {
              const radians = (transform.value * Math.PI) / 180;
              mesh.rotation[transform.axis] += radians;
            }
            break;
          case 'scale':
            if (transform.value !== undefined) {
              mesh.scale.multiplyScalar(transform.value);
            }
            break;
          case 'reset':
            mesh.position.set(0, 0, 0);
            mesh.rotation.set(0, 0, 0);
            mesh.scale.set(1, 1, 1);
            break;
        }
        
        return model;
      })
    );
  };

  const handleToothSelect = (tooth: ToothModel) => {
    console.log('Selected tooth:', tooth);
    // Here you would add the tooth to the scene
    setIsToothLibraryOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          models={models}
          onModelVisibilityToggle={handleModelVisibilityToggle}
          onModelColorChange={handleModelColorChange}
          onModelSelect={handleModelSelect}
          selectedModel={selectedModel}
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          onToolDeselect={handleToolDeselect}
          onTransform={handleTransform}
        />
        <Viewport3D
          models={models}
          onModelsChange={setModels}
          selectedModel={selectedModel}
          activeTool={activeTool}
          onTransform={handleTransform}
        />
      </div>
      
      <ToothLibrary
        isOpen={isToothLibraryOpen}
        onClose={() => setIsToothLibraryOpen(false)}
        onToothSelect={handleToothSelect}
      />
    </div>
  );
}

export default App;