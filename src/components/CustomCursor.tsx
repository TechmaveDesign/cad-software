import React from 'react';

interface CustomCursorProps {
  tool: string | null;
  size: number;
  color: string;
  position: { x: number; y: number };
  visible: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ 
  tool, 
  size, 
  color, 
  position, 
  visible 
}) => {
  if (!visible || !tool) return null;

  const getCursorIcon = () => {
    switch (tool) {
      case 'pencil':
        return (
          <div 
            className="pointer-events-none"
            style={{
              width: `${Math.max(size * 4, 16)}px`,
              height: `${Math.max(size * 4, 16)}px`,
              border: `2px solid ${color}`,
              borderRadius: '50%',
              backgroundColor: `${color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div 
              style={{
                width: `${Math.max(size * 2, 4)}px`,
                height: `${Math.max(size * 2, 4)}px`,
                backgroundColor: color,
                borderRadius: '50%'
              }}
            />
          </div>
        );
      case 'brush':
        return (
          <div 
            className="pointer-events-none"
            style={{
              width: `${Math.max(size * 6, 20)}px`,
              height: `${Math.max(size * 6, 20)}px`,
              border: `3px solid ${color}`,
              borderRadius: '50%',
              backgroundColor: `${color}22`,
            }}
          />
        );
      case 'eraser':
        return (
          <div 
            className="pointer-events-none"
            style={{
              width: `${Math.max(size * 5, 18)}px`,
              height: `${Math.max(size * 5, 18)}px`,
              border: '2px solid #ffffff',
              borderRadius: '50%',
              backgroundColor: '#ffffff44',
            }}
          />
        );
      case 'mask-brush':
        return (
          <div 
            className="pointer-events-none"
            style={{
              width: `${Math.max(size * 8, 24)}px`,
              height: `${Math.max(size * 8, 24)}px`,
              border: '2px dashed #ff00ff',
              borderRadius: '50%',
              backgroundColor: '#ff00ff22',
            }}
          />
        );
      default:
        return (
          <div 
            className="pointer-events-none w-4 h-4 border-2 rounded-full bg-opacity-30"
            style={{ 
              borderColor: '#4fc6c2',
              backgroundColor: '#4fc6c2'
            }}
          />
        );
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: 'none'
      }}
    >
      {getCursorIcon()}
    </div>
  );
};

export default CustomCursor;