import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Viewport3D from './components/Viewport3D';
import ToothLibrary from './components/ToothLibrary';
import { STLModel, ToothModel } from './types';

function App() {
  const [models, setModels] = useState<STLModel[]>([]);
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
    setActiveTool(activeTool === toolId ? null : toolId);
    
    // Open tooth library for specific tools
    if (toolId === 'add-volume') {
      setIsToothLibraryOpen(true);
    }
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
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
        />
        <Viewport3D
          models={models}
          onModelsChange={setModels}
          activeTool={activeTool}
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