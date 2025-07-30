import React from 'react';
import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Home, Eye, Maximize2 } from 'lucide-react';

interface TransformValues {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

interface CameraControlsProps {
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  onViewTop?: () => void;
  onViewFront?: () => void;
  onViewRight?: () => void;
  onViewIsometric?: () => void;
  onToggleOrthographic: () => void;
  isOrthographic: boolean;
  selectedModelId?: string | null;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  onResetView,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onViewTop,
  onViewFront,
  onViewRight,
  onViewIsometric,
  onToggleOrthographic,
  isOrthographic,
  selectedModelId,
}) => {
  const [transformValues, setTransformValues] = useState<TransformValues>({
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 1
  });
  const [showTransformControls, setShowTransformControls] = useState(false);

  // Reset transform values when model selection changes
  useEffect(() => {
    if (selectedModelId) {
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
  }, [selectedModelId]);

  const handleTransformChange = (property: keyof TransformValues, value: number) => {
    const newValues = { ...transformValues, [property]: value };
    setTransformValues(newValues);
    
    console.log('Camera Controls - Transform change:', property, 'to value:', value, 'for model:', selectedModelId);
    
    // Dispatch transform event to viewport
    if (selectedModelId) {
      console.log('Camera Controls - Dispatching model-transform event with values:', newValues);
      window.dispatchEvent(new CustomEvent('model-transform', {
        detail: {
          modelId: selectedModelId,
          transform: newValues
        }
      }));
    } else {
      console.log('Camera Controls - No model selected for transform');
    }
  };

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
    
    setTransformValues(resetValues);
    
    if (selectedModelId) {
      console.log('Camera Controls - Resetting transform values for model:', selectedModelId);
      window.dispatchEvent(new CustomEvent('model-transform', {
        detail: {
          modelId: selectedModelId,
          transform: resetValues
        }
      }));
    }
  };

  const viewButtons = [
    { id: 'top', name: 'Top', onClick: onViewTop, icon: '⬆️' },
    { id: 'front', name: 'Front', onClick: onViewFront, icon: '⬅️' },
    { id: 'right', name: 'Right', onClick: onViewRight, icon: '➡️' },
    { id: 'iso', name: 'Isometric', onClick: onViewIsometric, icon: '📐' }
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-3">
      <div className="flex flex-col space-y-3">
        {/* First Row - Camera Controls */}
        <div className="flex items-center justify-between">
        {/* Camera Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm font-medium mr-3">Camera:</span>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-zoom-in'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-zoom-out'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-fit-screen'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200"
              title="Fit to Screen"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            {viewButtons.map(view => (
              <button
                key={view.id}
                onClick={() => window.dispatchEvent(new CustomEvent(`camera-view-${view.id}`))}
                className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200 text-xs font-medium"
                title={`${view.name} View`}
              >
                <span className="mr-1">{view.icon}</span>
                {view.name}
              </button>
            ))}
          </div>

          {/* Reset and Projection */}
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-reset'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200"
              title="Reset View"
            >
              <Home size={16} />
            </button>
            <button
              onClick={onToggleOrthographic}
              className={`p-2 rounded transition-colors duration-200 ${
                isOrthographic
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
              title={`Switch to ${isOrthographic ? 'Perspective' : 'Orthographic'} View`}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
        </div>

        {/* Second Row - Model Transform Controls */}
        {selectedModelId && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm font-medium">Model Transform:</span>
              <button
                onClick={() => setShowTransformControls(!showTransformControls)}
                className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${
                  showTransformControls
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {showTransformControls ? 'Hide Controls' : 'Show Controls'}
              </button>
              <button
                onClick={resetTransformValues}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors duration-200"
              >
                Reset
              </button>
            </div>
            <div className="text-slate-400 text-sm">
              Selected Model: {selectedModelId?.slice(0, 8)}...
            </div>
          </div>
        )}

        {/* Third Row - Transform Sliders */}
        {selectedModelId && showTransformControls && (
          <div className="bg-slate-700 p-4 rounded-lg space-y-4">
            {/* Translation Controls */}
            <div className="space-y-3">
              <h5 className="text-slate-300 text-xs font-medium uppercase tracking-wide">Translate</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">X Position</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="0.1"
                    value={transformValues.posX}
                    onChange={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                    onInput={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-slate-500 text-xs mt-1 text-center">{transformValues.posX.toFixed(1)}</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Y Position</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="0.1"
                    value={transformValues.posY}
                    onChange={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                    onInput={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-slate-500 text-xs mt-1 text-center">{transformValues.posY.toFixed(1)}</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Z Position</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="0.1"
                    value={transformValues.posZ}
                    onChange={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                    onInput={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-slate-500 text-xs mt-1 text-center">{transformValues.posZ.toFixed(1)}</div>
                </div>
              </div>
            </div>
            
            {/* Rotation Controls */}
            <div className="space-y-3">
              <h5 className="text-slate-300 text-xs font-medium uppercase tracking-wide">Rotate</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">X Rotation</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={transformValues.rotX}
                    onChange={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                    onInput={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-slate-500 text-xs mt-1 text-center">{transformValues.rotX}°</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Y Rotation</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={transformValues.rotY}
                    onChange={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                    onInput={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-slate-500 text-xs mt-1 text-center">{transformValues.rotY}°</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Z Rotation</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={transformValues.rotZ}
                    onChange={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                    onInput={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-slate-500 text-xs mt-1 text-center">{transformValues.rotZ}°</div>
                </div>
              </div>
            </div>
            
            {/* Scale Control */}
            <div className="space-y-3">
              <h5 className="text-slate-300 text-xs font-medium uppercase tracking-wide">Scale</h5>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-slate-400 text-xs mb-1">Uniform Scale</label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={transformValues.scale}
                    onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                    onInput={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-slate-500 text-xs mt-1 text-center">{transformValues.scale.toFixed(1)}x</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Camera Info Row */}
        {/* Camera Info */}
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            <span className="mr-4">Projection: {isOrthographic ? 'Orthographic' : 'Perspective'}</span>
          </div>
          <div className="text-slate-400 text-sm">
            <span>
              Use mouse wheel to zoom, drag to rotate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;