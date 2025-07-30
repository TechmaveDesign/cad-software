import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CameraControls from './components/CameraControls';
import Viewport3D from './components/Viewport3D';
import ToothLibrary from './components/ToothLibrary';
import { STLModel, ToothModel } from './types';
import { DrawingSettings } from './components/Sidebar';

function App() {
  const [models, setModels] = useState<STLModel[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isToothLibraryOpen, setIsToothLibraryOpen] = useState(false);
  const [isOrthographic, setIsOrthographic] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    brushSize: 2.0,
    brushOpacity: 0.8,
    brushColor: '#ff0000',
    pencilSize: 0.5,
    pencilColor: '#00ff00',
    lineWidth: 1.0,
    lineColor: '#0000ff'
  });

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

  const handleDrawingSettingsChange = (settings: DrawingSettings) => {
    setDrawingSettings(settings);
  };

  const handleToothSelect = (tooth: ToothModel) => {
    console.log('Selected tooth:', tooth);
    // Here you would add the tooth to the scene
    setIsToothLibraryOpen(false);
  };

  // Camera control handlers
  const handleResetView = () => {
    // This will be handled by the Viewport3D component
  };

  const handleZoomIn = () => {
    // This will be handled by the Viewport3D component
  };

  const handleZoomOut = () => {
    // This will be handled by the Viewport3D component
  };

  const handleFitToScreen = () => {
    // This will be handled by the Viewport3D component
  };

  const handleViewTop = () => {
    // This will be handled by the Viewport3D component
  };

  const handleViewFront = () => {
    // This will be handled by the Viewport3D component
  };

  const handleViewRight = () => {
    // This will be handled by the Viewport3D component
  };

  const handleViewIsometric = () => {
    // This will be handled by the Viewport3D component
  };

  const handleToggleOrthographic = () => {
    setIsOrthographic(!isOrthographic);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <Navbar />
      <CameraControls
        onToggleOrthographic={handleToggleOrthographic}
        isOrthographic={isOrthographic}
        selectedModelId={selectedModelId}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          models={models}
          onModelVisibilityToggle={handleModelVisibilityToggle}
          onModelColorChange={handleModelColorChange}
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          drawingSettings={drawingSettings}
          onDrawingSettingsChange={handleDrawingSettingsChange}
          selectedModelId={selectedModelId}
          onModelSelect={setSelectedModelId}
        />
        <Viewport3D
          models={models}
          onModelsChange={setModels}
          activeTool={activeTool}
          drawingSettings={drawingSettings}
          isOrthographic={isOrthographic}
          selectedModelId={selectedModelId}
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