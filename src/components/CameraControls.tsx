import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Home, Eye, Maximize2, RotateCw, Move3D, Scale, RotateCw as RotateClockwise, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveHorizontal, MoveVertical, Rotate3D as RotateX, Rotate3D as RotateY, Rotate3D as RotateZ, Minus, Plus } from 'lucide-react';

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
  onScaleTool?: () => void;
  onRotateTool?: () => void;
  activeTransformTool?: string | null;
  onTranslateTool?: () => void;
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
  onScaleTool,
  onRotateTool,
  activeTransformTool,
  onTranslateTool
}) => {
  const viewButtons = [
    { id: 'top', name: 'Top', onClick: onViewTop, icon: '⬆️' },
    { id: 'front', name: 'Front', onClick: onViewFront, icon: '⬅️' },
    { id: 'right', name: 'Right', onClick: onViewRight, icon: '➡️' },
    { id: 'iso', name: 'Isometric', onClick: onViewIsometric, icon: '📐' }
  ];

  const handleTransformAction = (action: string) => {
    console.log('Dispatching transform action:', action);
    window.dispatchEvent(new CustomEvent('transform-action', { detail: { action } }));
  };

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
              onClick={onTranslateTool}
              className={`p-2 rounded transition-colors duration-200 ${
                activeTransformTool === 'translate'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
              title="Translate Tool"
            >
              <Move3D size={16} />
            </button>
            <button
              onClick={onScaleTool}
              className={`p-2 rounded transition-colors duration-200 ${
                activeTransformTool === 'scale'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
              title="Scale Tool"
            >
              <Scale size={16} />
            </button>
            <button
              onClick={onRotateTool}
              className={`p-2 rounded transition-colors duration-200 ${
                activeTransformTool === 'rotate'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
              title="Rotate Tool"
            >
              <RotateClockwise size={16} />
            </button>
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

        {/* Second Row - Transform Controls (only show when transform tool is active) */}
        {['translate', 'rotate', 'scale'].includes(activeTransformTool || '') && (
          <div className="flex items-center justify-center space-x-4 bg-slate-700 rounded-lg p-3">
            {activeTransformTool === 'translate' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm font-medium mr-2">Translate:</span>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('translate-x-pos')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Move +X"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('translate-x-neg')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Move -X"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">X</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('translate-y-pos')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Move +Y"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('translate-y-neg')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Move -Y"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">Y</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('translate-z-pos')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Move +Z"
                  >
                    <MoveVertical size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('translate-z-neg')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Move -Z"
                  >
                    <MoveHorizontal size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">Z</span>
                </div>
              </div>
            )}

            {activeTransformTool === 'rotate' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm font-medium mr-2">Rotate:</span>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('rotate-x-pos')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Rotate +X (15°)"
                  >
                    <RotateClockwise size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('rotate-x-neg')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Rotate -X (15°)"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">X</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('rotate-y-pos')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Rotate +Y (15°)"
                  >
                    <RotateClockwise size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('rotate-y-neg')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Rotate -Y (15°)"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">Y</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('rotate-z-pos')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Rotate +Z (15°)"
                  >
                    <RotateClockwise size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('rotate-z-neg')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Rotate -Z (15°)"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">Z</span>
                </div>
              </div>
            )}

            {activeTransformTool === 'scale' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm font-medium mr-2">Scale:</span>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('scale-up')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale Up (110%)"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('scale-down')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale Down (90%)"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">Uniform</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('scale-x-up')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale X Up"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('scale-x-down')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale X Down"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">X</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('scale-y-up')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale Y Up"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('scale-y-down')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale Y Down"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">Y</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-600 rounded p-1">
                  <button
                    onClick={() => handleTransformAction('scale-z-up')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale Z Up"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleTransformAction('scale-z-down')}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-500 rounded transition-colors duration-200"
                    title="Scale Z Down"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs text-slate-400 px-1">Z</span>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Camera Info */}
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            <span className="mr-4">Projection: {isOrthographic ? 'Orthographic' : 'Perspective'}</span>
            {activeTransformTool && (
              <span className="mr-4 text-blue-400">Transform Mode: {activeTransformTool}</span>
            )}
          </div>
        <div className="text-slate-400 text-sm">
            <span>
              {activeTransformTool ? 
                'Select a model to transform, or use buttons above for precise control' :
                'Use mouse wheel to zoom, drag to rotate'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;