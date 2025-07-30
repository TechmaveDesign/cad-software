import React, { useState, useEffect } from 'react';
import { Move3D, RotateCw, Scale, X } from 'lucide-react';

interface TransformPanelProps {
  selectedModel: THREE.Mesh | null;
  isVisible: boolean;
  onClose: () => void;
}

const TransformPanel: React.FC<TransformPanelProps> = ({
  selectedModel,
  isVisible,
  onClose
}) => {
  const [transforms, setTransforms] = useState({
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 1
  });

  // Reset sliders when model changes
  useEffect(() => {
    if (selectedModel) {
      setTransforms({
        posX: selectedModel.position.x,
        posY: selectedModel.position.y,
        posZ: selectedModel.position.z,
        rotX: selectedModel.rotation.x * 180 / Math.PI,
        rotY: selectedModel.rotation.y * 180 / Math.PI,
        rotZ: selectedModel.rotation.z * 180 / Math.PI,
        scale: selectedModel.scale.x
      });
    } else {
      resetTransforms();
    }
  }, [selectedModel]);

  const resetTransforms = () => {
    setTransforms({
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1
    });
  };

  const handleTransformChange = (property: string, value: number) => {
    if (!selectedModel) return;

    const newTransforms = { ...transforms, [property]: value };
    setTransforms(newTransforms);

    // Apply transforms to the selected model
    selectedModel.position.set(
      newTransforms.posX,
      newTransforms.posY,
      newTransforms.posZ
    );

    selectedModel.rotation.set(
      newTransforms.rotX * Math.PI / 180,
      newTransforms.rotY * Math.PI / 180,
      newTransforms.rotZ * Math.PI / 180
    );

    selectedModel.scale.set(
      newTransforms.scale,
      newTransforms.scale,
      newTransforms.scale
    );

    // Force matrix update
    selectedModel.updateMatrix();
    selectedModel.updateMatrixWorld(true);
  };

  const resetToDefaults = () => {
    if (!selectedModel) return;
    
    resetTransforms();
    selectedModel.position.set(0, 0, 0);
    selectedModel.rotation.set(0, 0, 0);
    selectedModel.scale.set(1, 1, 1);
    selectedModel.updateMatrix();
    selectedModel.updateMatrixWorld(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-lg p-4 w-80 z-50 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center space-x-2">
          <Move3D size={18} />
          <span>Transform Controls</span>
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors duration-200"
        >
          <X size={18} />
        </button>
      </div>

      {!selectedModel ? (
        <div className="text-slate-400 text-center py-8">
          <Move3D size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a model to transform</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Translation Controls */}
          <div className="space-y-3">
            <h4 className="text-slate-300 font-medium flex items-center space-x-2">
              <Move3D size={16} />
              <span>Translate</span>
            </h4>
            
            <div className="space-y-2">
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  X Position: {transforms.posX.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="0.1"
                  value={transforms.posX}
                  onChange={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Y Position: {transforms.posY.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="0.1"
                  value={transforms.posY}
                  onChange={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Z Position: {transforms.posZ.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="0.1"
                  value={transforms.posZ}
                  onChange={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="space-y-3">
            <h4 className="text-slate-300 font-medium flex items-center space-x-2">
              <RotateCw size={16} />
              <span>Rotate</span>
            </h4>
            
            <div className="space-y-2">
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  X Rotation: {transforms.rotX.toFixed(0)}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={transforms.rotX}
                  onChange={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Y Rotation: {transforms.rotY.toFixed(0)}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={transforms.rotY}
                  onChange={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Z Rotation: {transforms.rotZ.toFixed(0)}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={transforms.rotZ}
                  onChange={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Scale Controls */}
          <div className="space-y-3">
            <h4 className="text-slate-300 font-medium flex items-center space-x-2">
              <Scale size={16} />
              <span>Scale</span>
            </h4>
            
            <div>
              <label className="block text-slate-400 text-sm mb-1">
                Uniform Scale: {transforms.scale.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value={transforms.scale}
                onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={resetToDefaults}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #475569;
        }
        
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default TransformPanel;