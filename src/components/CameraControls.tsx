import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Home, Eye, Maximize2, RotateCw, Move3D } from 'lucide-react';

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
}

const CameraControls: React.FC<CameraControlsProps> = ({
  onResetView,
  onZoomIn,
  onZoomOut,
  onViewTop,
  onViewFront,
  onViewRight,
  onViewIsometric,
}) => {
  const viewButtons = [
    { id: 'top', name: 'Top', onClick: onViewTop, icon: '⬆️' },
    { id: 'front', name: 'Front', onClick: onViewFront, icon: '⬅️' },
    { id: 'right', name: 'Right', onClick: onViewRight, icon: '➡️' },
    { id: 'iso', name: 'Isometric', onClick: onViewIsometric, icon: '📐' }
  ];

  const transformButtons = [
    { id: 'scale', name: 'Scale', icon: '🔍', action: () => window.dispatchEvent(new CustomEvent('camera-scale-mode')) },
    { id: 'rotate', name: 'Rotate', icon: '🔄', action: () => window.dispatchEvent(new CustomEvent('camera-rotate-mode')) }
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-3">
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

          {/* Transform Controls */}
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            {transformButtons.map(transform => (
              <button
                key={transform.id}
                onClick={transform.action}
                className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200 text-xs font-medium"
                title={`${transform.name} Mode`}
              >
                <span className="mr-1">{transform.icon}</span>
                {transform.name}
              </button>
            ))}
          </div>

          {/* Reset and Projection */}
          <div className="flex items-center bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('camera-reset'))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200"
              title="Reset View"
            >
              <Home size={16} />
            </button>
          </div>
        </div>

        {/* Camera Info */}
        <div className="text-slate-400 text-sm">
          <span>Use mouse wheel to zoom, drag to rotate, scale/rotate tools for precise control</span>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;