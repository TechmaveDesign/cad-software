import React, { useState, useEffect } from 'react';
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
  selectedModelId
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
    const reset = {
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1
    };
    setTransformValues(reset);

    if (selectedModelId) {
      window.dispatchEvent(new CustomEvent('transform-sliders', {
        detail: {
          modelId: selectedModelId,
          transform: reset
        }
      }));
    }
  };

  const viewButtons = [
    { id: 'top', name: 'Top', icon: '⬆️', onClick: onViewTop },
    { id: 'front', name: 'Front', icon: '⬅️', onClick: onViewFront },
    { id: 'right', name: 'Right', icon: '➡️', onClick: onViewRight },
    { id: 'iso', name: 'Isometric', icon: '📐', onClick: onViewIsometric }
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-3">
      <div className="flex flex-col space-y-3">

        {/* Camera Control Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm font-medium mr-3">Camera:</span>

          {/* Zoom, Fit, Reset */}
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-zoom-in'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-zoom-out'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-fit-screen'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded"
              title="Fit to Screen"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-reset'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded"
              title="Reset View"
            >
              <Home size={16} />
            </button>
          </div>

          {/* Projection Mode Toggle */}
          <button
            onClick={onToggleOrthographic}
            className={`p-2 rounded transition-colors duration-200 ${
              isOrthographic ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'
            }`}
            title={`Switch to ${isOrthographic ? 'Perspective' : 'Orthographic'} View`}
          >
            <Eye size={16} />
          </button>
        </div>

        {/* View Buttons */}
        <div className="flex items-center space-x-2">
          {viewButtons.map((view) => (
            <button
              key={view.id}
              onClick={() => window.dispatchEvent(new CustomEvent(`camera-view-${view.id}`))}
              className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-600 rounded bg-slate-700 transition-colors duration-200"
              title={`${view.name} View`}
            >
              <span className="mr-1">{view.icon}</span>
              {view.name}
            </button>
          ))}
        </div>

        {/* Toggle Transform Controls */}
        {selectedModelId && (
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 text-sm">Transform: </span>
            <button
              onClick={() => setShowTransformControls(!showTransformControls)}
              className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
                showTransformControls ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showTransformControls ? 'Hide Controls' : 'Show Controls'}
            </button>
            <button
              onClick={resetTransformValues}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
            >
              Reset
            </button>
          </div>
        )}

        {/* Transform Sliders */}
        {selectedModelId && showTransformControls && (
          <div className="bg-slate-700 p-4 rounded-lg space-y-4">
            {/* Translate */}
            <div>
              <h5 className="text-slate-300 text-xs mb-2 font-medium uppercase">Translate</h5>
              {['posX', 'posY', 'posZ'].map(axis => (
                <div key={axis}>
                  <label className="text-slate-400 text-xs capitalize">{axis}:</label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={0.1}
                    value={transformValues[axis as keyof TransformValues]}
                    onChange={(e) => handleTransformChange(axis as keyof TransformValues, parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg"
                  />
                </div>
              ))}
            </div>

            {/* Rotate */}
            <div>
              <h5 className="text-slate-300 text-xs mb-2 font-medium uppercase">Rotate</h5>
              {['rotX', 'rotY', 'rotZ'].map(axis => (
                <div key={axis}>
                  <label className="text-slate-400 text-xs capitalize">{axis}:</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={transformValues[axis as keyof TransformValues]}
                    onChange={(e) => handleTransformChange(axis as keyof TransformValues, parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg"
                  />
                </div>
              ))}
            </div>

            {/* Scale */}
            <div>
              <h5 className="text-slate-300 text-xs mb-2 font-medium uppercase">Scale</h5>
              <label className="text-slate-400 text-xs">Uniform Scale:</label>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.1}
                value={transformValues.scale}
                onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-slate-400 text-xs pt-2 flex justify-between">
          <span>Projection: {isOrthographic ? 'Orthographic' : 'Perspective'}</span>
          <span>Drag to rotate, wheel to zoom</span>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;
