// This file is no longer needed as drawing tools have been moved to the sidebar
export interface DrawingSettings {
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  pencilSize: number;
  pencilColor: string;
  lineWidth: number;
  lineColor: string;
}

// Re-export for backward compatibility
export default function DrawingToolbar() {
  return null;
}