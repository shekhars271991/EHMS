import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface EyeCanvasProps {
  eye: 'OD' | 'OS';
  type: 'ANTERIOR' | 'FUNDUS';
}

export const EyeCanvas: React.FC<EyeCanvasProps> = ({ eye, type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444'); // default red (retinal tears/lesions)
  const [brushSize, setBrushSize] = useState(3);

  // Initialize canvas background schematic
  const drawBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw circular schematic
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90;

    // Outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (type === 'ANTERIOR') {
      // Draw inner pupil & limbus
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.stroke();

      // Axis crosshairs
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Fundus schematic: Optic Disc & Macula
      const discX = eye === 'OD' ? centerX - 35 : centerX + 35;
      ctx.beginPath();
      ctx.arc(discX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.stroke();

      // Macula
      const maculaX = eye === 'OD' ? centerX + 25 : centerX - 25;
      ctx.beginPath();
      ctx.arc(maculaX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fee2e2';
      ctx.fill();
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawBackground();
  }, [eye, type]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 inline-block shadow-2xs">
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="font-bold text-slate-700">
          {eye} {type === 'ANTERIOR' ? 'Cornea / Slit Lamp' : 'Retinal Fundus'} Sketch
        </span>
        <button
          onClick={drawBackground}
          title="Reset canvas"
          className="text-slate-400 hover:text-slate-700 p-1 rounded"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="border border-slate-300 rounded bg-slate-50 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={240}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Drawing controls */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setColor('#ef4444')} // Red (tear / hemorrhage)
            className={`w-4 h-4 rounded-full bg-red-500 border ${color === '#ef4444' ? 'ring-2 ring-slate-800' : ''}`}
            title="Red (Tear / Hemorrhage)"
          />
          <button
            onClick={() => setColor('#22c55e')} // Green (fluorescein stain / corneal ulcer)
            className={`w-4 h-4 rounded-full bg-emerald-500 border ${color === '#22c55e' ? 'ring-2 ring-slate-800' : ''}`}
            title="Green (Corneal Stain)"
          />
          <button
            onClick={() => setColor('#3b82f6')} // Blue (edema)
            className={`w-4 h-4 rounded-full bg-blue-500 border ${color === '#3b82f6' ? 'ring-2 ring-slate-800' : ''}`}
            title="Blue (Edema / Detachment)"
          />
          <button
            onClick={() => setColor('#1e293b')} // Dark (scar / laser burn)
            className={`w-4 h-4 rounded-full bg-slate-800 border ${color === '#1e293b' ? 'ring-2 ring-slate-800' : ''}`}
            title="Black (Laser Scar)"
          />
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-[10px] text-slate-400">Size:</span>
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="text-[10px] border border-slate-200 rounded px-1 py-0.5"
          >
            <option value={2}>Fine</option>
            <option value={4}>Med</option>
            <option value={7}>Thick</option>
          </select>
        </div>
      </div>
    </div>
  );
};
