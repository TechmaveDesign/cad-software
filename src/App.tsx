import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DrawingToolbar from './components/DrawingToolbar';
import CameraControls from './components/CameraControls';
import Viewport3D from './components/Viewport3D';
import ToothLibrary from './components/ToothLibrary';
import ProfileSettings from './components/ProfileSettings';
import { STLModel, ToothModel } from './types';
import { DrawingSettings } from './components/DrawingToolbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [models, setModels] = useState<STLModel[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isToothLibraryOpen, setIsToothLibraryOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isOrthographic, setIsOrthographic] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
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

  const handleModelTranslate = (direction: 'left' | 'right' | 'up' | 'down') => {
    // This will be handled by the Viewport3D component
    window.dispatchEvent(new CustomEvent('model-translate', { detail: { direction } }));
  };

  // If profile settings is open, show only the profile page
  if (showProfileSettings) {
    return (
      <ProfileSettings onBackToWorkspace={() => setShowProfileSettings(false)} />
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <Navbar onProfileClick={() => setShowProfileSettings(true)} />
      <CameraControls
        onResetView={() => {}}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onFitToScreen={() => {}}
        onViewTop={() => {}}
        onViewFront={() => {}}
        onViewRight={() => {}}
        onViewIsometric={() => {}}
        onToggleOrthographic={handleToggleOrthographic}
        isOrthographic={isOrthographic}
        onModelTranslate={handleModelTranslate}
      />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          models={models}
          onModelVisibilityToggle={handleModelVisibilityToggle}
          onModelColorChange={handleModelColorChange}
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          onModelsAdd={(files) => {
            console.log('Adding models from sidebar:', files.length);
            const newModels: STLModel[] = files.map((file, index) => ({
              id: `model-${Date.now()}-${index}`,
              name: file.name,
              type: models.length % 2 === 0 ? 'upper' : 'lower',
              visible: true,
              color: models.length % 2 === 0 ? '#3b82f6' : '#10b981',
              file
            }));
            setModels(prevModels => [...prevModels, ...newModels]);
          }}
        />
        <Viewport3D
          models={models}
          onModelsChange={setModels}
          activeTool={activeTool}
          drawingSettings={drawingSettings}
          isOrthographic={isOrthographic}
          showGrid={showGrid}
          onGridToggle={setShowGrid}
        />
        
        {/* Fixed Right Side Drawing Toolbar */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-40">
          <DrawingToolbar
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            onSettingsChange={handleDrawingSettingsChange}
          />
        </div>
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