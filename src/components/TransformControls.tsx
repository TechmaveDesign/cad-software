import React from 'react';
import { Move3D, RotateCw, Maximize2, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface TransformControlsProps {
  selectedModel: string | null;
  onTransform: (modelId: string, transform: TransformOperation) => void;
}

export interface TransformOperation {
  type: 'move' | 'rotate' | 'scale' | 'reset';
  axis?: 'x' | 'y' | 'z';
  value?: number;
}

const TransformControls: React.FC<TransformControlsProps> = ({
  selectedModel,
  onTransform
}) => {
  if (!selectedModel) {
    return (
      <div className="p-4 text-center text-slate-500">
        Select a model to transform
      </div>
    );
  }

  const handleTransform = (operation: TransformOperation) => {
    onTransform(selectedModel, operation);
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-slate-300 font-medium mb-4">Transform Controls</h3>
      
      {/* Move Controls */}
      <div className="space-y-3">
        <h4 className="text-slate-400 text-sm font-medium flex items-center">
          <Move3D size={14} className="mr-2" />
          Move
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleTransform({ type: 'move', axis: 'x', value: 1 })}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          >
            +X
          </button>
          <button
            onClick={() => handleTransform({ type: 'move', axis: 'y', value: 1 })}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
          >
            +Y
          </button>
          <button
            onClick={() => handleTransform({ type: 'move', axis: 'z', value: 1 })}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            +Z
          </button>
          <button
            onClick={() => handleTransform({ type: 'move', axis: 'x', value: -1 })}
            className="px-3 py-2 bg-red-800 hover:bg-red-900 text-white text-xs rounded transition-colors"
          >
            -X
          </button>
          <button
            onClick={() => handleTransform({ type: 'move', axis: 'y', value: -1 })}
            className="px-3 py-2 bg-green-800 hover:bg-green-900 text-white text-xs rounded transition-colors"
          >
            -Y
          </button>
          <button
            onClick={() => handleTransform({ type: 'move', axis: 'z', value: -1 })}
            className="px-3 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs rounded transition-colors"
          >
            -Z
          </button>
        </div>
      </div>

      {/* Rotate Controls */}
      <div className="space-y-3">
        <h4 className="text-slate-400 text-sm font-medium flex items-center">
          <RotateCw size={14} className="mr-2" />
          Rotate
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTransform({ type: 'rotate', axis: 'x', value: 15 })}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors flex items-center justify-center"
          >
            <RotateCw size={12} className="mr-1" />
            X 15°
          </button>
          <button
            onClick={() => handleTransform({ type: 'rotate', axis: 'x', value: -15 })}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors flex items-center justify-center"
          >
            <RotateCcw size={12} className="mr-1" />
            X 15°
          </button>
          <button
            onClick={() => handleTransform({ type: 'rotate', axis: 'y', value: 15 })}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors flex items-center justify-center"
          >
            <RotateCw size={12} className="mr-1" />
            Y 15°
          </button>
          <button
            onClick={() => handleTransform({ type: 'rotate', axis: 'y', value: -15 })}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors flex items-center justify-center"
          >
            <RotateCcw size={12} className="mr-1" />
            Y 15°
          </button>
          <button
            onClick={() => handleTransform({ type: 'rotate', axis: 'z', value: 15 })}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors flex items-center justify-center"
          >
            <RotateCw size={12} className="mr-1" />
            Z 15°
          </button>
          <button
            onClick={() => handleTransform({ type: 'rotate', axis: 'z', value: -15 })}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors flex items-center justify-center"
          >
            <RotateCcw size={12} className="mr-1" />
            Z 15°
          </button>
        </div>
      </div>

      {/* Scale Controls */}
      <div className="space-y-3">
        <h4 className="text-slate-400 text-sm font-medium flex items-center">
          <Maximize2 size={14} className="mr-2" />
          Scale
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTransform({ type: 'scale', value: 1.1 })}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
          >
            Scale Up 10%
          </button>
          <button
            onClick={() => handleTransform({ type: 'scale', value: 0.9 })}
            className="px-3 py-2 bg-purple-800 hover:bg-purple-900 text-white text-xs rounded transition-colors"
          >
            Scale Down 10%
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="text-slate-400 text-sm font-medium">Quick Actions</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleTransform({ type: 'reset' })}
            className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
          >
            Reset Transform
          </button>
        </div>
      </div>

      {/* Precision Controls */}
      <div className="space-y-3">
        <h4 className="text-slate-400 text-sm font-medium">Precision Move</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-slate-500 text-xs mb-1">X Position</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-slate-500 text-xs mb-1">Y Position</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-slate-500 text-xs mb-1">Z Position</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs"
              placeholder="0.0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformControls;