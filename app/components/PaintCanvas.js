'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Users, Download, Maximize, Minimize } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const STORAGE_KEY = 'wake-up-india-gallery';

const templates = [
  { name: 'Amit', src: '/images/Amit.png' },
  { name: 'Dharmendra', src: '/images/Dharmendra.png' },
  { name: 'Modi', src: '/images/Modi.png' },
  { name: 'Nirmala', src: '/images/Nirmala.png' },
  { name: 'Nitin', src: '/images/Nitin.png' },
];

export default function PaintCanvas({ isCommunityMode = false }) {
  const canvasRef = useRef(null);
  const currentStrokeRef = useRef([]);
  const lastSyncTimeRef = useRef(0);
  const clientIdRef = useRef(null);
  
  useEffect(() => {
    if (!clientIdRef.current) {
      clientIdRef.current = Math.random().toString(36).substring(7);
    }
  }, []);
  
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#FF2A2A');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [status, setStatus] = useState('Ready to paint.');
  const [artistName, setArtistName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[1].src);
  const [liveUsers, setLiveUsers] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [textInput, setTextInput] = useState('WAKE UP');
  const [selectedSticker, setSelectedSticker] = useState('✊');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const localStrokesRef = useRef([]);
  const privateUndoStackRef = useRef([]);
  const lastCommunityStrokeIdRef = useRef(null);
  const palette = useMemo(
    () => ['#050505', '#111111', '#2C2C2C', '#8B0000', '#FF2A2A', '#A50000', '#F7F2E8', '#FF8C00', '#1F6FEB'],
    []
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTemplate = (callback) => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a fixed internal resolution for consistent painting and brush sizes
    const width = 900;
    const height = 600;

    canvas.width = width;
    canvas.height = height;
    
    // Reset transform to ensure 1:1 mapping internally
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      const scale = Math.min(width / imgWidth, height / imgHeight);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      ctx.filter = 'grayscale(100%) contrast(120%) sepia(20%)';
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      setStatus('Template loaded.');
      if (callback) callback();
    };
    img.onerror = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);
      setStatus('Template unavailable.');
      if (callback) callback();
    };
    img.src = selectedTemplate;
  };

  const drawStroke = (ctx, stroke) => {
    if (!stroke.points || stroke.points.length === 0) return;
    ctx.beginPath();
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.tool === 'text' ? stroke.color : '#FFF';
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    
    if (stroke.tool === 'text' || stroke.tool === 'sticker') {
      ctx.font = `bold ${stroke.size * 5}px "Courier New", Courier, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stroke.text, stroke.points[0].x, stroke.points[0].y);
    } else if (stroke.tool === 'spray') {
      stroke.points.forEach(p => {
        const density = stroke.size * 4;
        for (let i = 0; i < density; i++) {
          const offsetAngle = Math.random() * Math.PI * 2;
          const offsetRadius = Math.random() * stroke.size * 1.5;
          ctx.fillRect(p.x + Math.cos(offsetAngle) * offsetRadius, p.y + Math.sin(offsetAngle) * offsetRadius, 1.5, 1.5);
        }
      });
    } else {
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
    ctx.closePath();
  };

  const redrawCanvas = () => {
    loadTemplate(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      localStrokesRef.current.forEach(s => drawStroke(ctx, s));
    });
  };

  useEffect(() => {
    localStrokesRef.current = [];
    lastSyncTimeRef.current = 0;
    redrawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  // Real-time backend polling for community strokes
  useEffect(() => {
    if (!isCommunityMode) return;
    
    const fetchStrokes = async () => {
      try {
        const res = await fetch(`/api/strokes?since=${lastSyncTimeRef.current}&clientId=${clientIdRef.current}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.liveUsers !== undefined) {
          setLiveUsers(data.liveUsers);
        }
        
        if (data.strokes && data.strokes.length > 0) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          
          let needsRedraw = false;
          
          data.strokes.forEach(stroke => {
            if (stroke.timestamp > lastSyncTimeRef.current) {
               lastSyncTimeRef.current = stroke.timestamp;
            }
            if (stroke.type === 'undo') {
              localStrokesRef.current = localStrokesRef.current.filter(s => s.id !== stroke.targetId);
              needsRedraw = true;
            } else {
              localStrokesRef.current.push(stroke);
              if (!needsRedraw) drawStroke(ctx, stroke);
            }
          });
          
          if (needsRedraw) redrawCanvas();
        }
      } catch (err) {
        console.error("Failed to sync strokes:", err);
      }
    };

    const syncInterval = setInterval(fetchStrokes, 1500);
    return () => clearInterval(syncInterval);
  }, [isCommunityMode]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const drawSpray = (ctx, point) => {
    const density = brushSize * 4;
    ctx.fillStyle = tool === 'eraser' ? '#111' : color;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    
    for (let i = 0; i < density; i++) {
      const offsetAngle = Math.random() * Math.PI * 2;
      const offsetRadius = Math.random() * brushSize * 1.5;
      const x = point.x + Math.cos(offsetAngle) * offsetRadius;
      const y = point.y + Math.sin(offsetAngle) * offsetRadius;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  };

  const startDrawing = (event) => {
    if (isCommunityMode && strokeCount >= 1) {
      showToast("You have already used your 1 stroke for the community. Share it to the public record!");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isCommunityMode) {
      privateUndoStackRef.current.push(canvas.toDataURL());
      if (privateUndoStackRef.current.length > 30) privateUndoStackRef.current.shift();
    }

    const ctx = canvas.getContext('2d');
    const point = getPoint(event);

    setIsDrawing(true);
    setStatus(tool === 'eraser' ? 'Erasing...' : 'Painting...');
    
    currentStrokeRef.current = [point];

    if (tool === 'text' || tool === 'sticker') {
      const textToDraw = tool === 'text' ? textInput : selectedSticker;
      ctx.font = `bold ${brushSize * 5}px "Courier New", Courier, monospace`;
      ctx.fillStyle = tool === 'text' ? color : '#FFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textToDraw, point.x, point.y);
      stopDrawing(null, true); // Trigger save immediately
      return;
    }

    if (tool === 'spray') {
      drawSpray(ctx, point);
    } else {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = tool === 'eraser' ? '#111' : color;
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const continueDrawing = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getPoint(event);
    
    // Limit array size to avoid massive payloads
    if (currentStrokeRef.current.length < 500) {
      currentStrokeRef.current.push(point);
    }

    if (tool === 'spray') {
      drawSpray(ctx, point);
    } else {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = async (event, isInstant = false) => {
    if (!isDrawing && !isInstant) return;
    
    if (tool !== 'spray' && tool !== 'text' && tool !== 'sticker') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.closePath();
    }
    setIsDrawing(false);
    setStrokeCount(prev => prev + 1);
    setStatus('Stroke added.');
    
    // Push stroke to backend if in community mode
    if (isCommunityMode && currentStrokeRef.current.length > 0) {
      try {
        const res = await fetch('/api/strokes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool,
            color: tool === 'eraser' ? '#111' : color,
            size: brushSize,
            points: currentStrokeRef.current,
            text: tool === 'text' ? textInput : (tool === 'sticker' ? selectedSticker : '')
          })
        });
        const data = await res.json();
        if (data.stroke && data.stroke.id) {
          lastCommunityStrokeIdRef.current = data.stroke.id;
        }
      } catch (e) {
        console.error("Error saving stroke:", e);
      }
    }
    currentStrokeRef.current = [];
  };

  const clearCanvas = () => {
    redrawCanvas();
    setIsSaved(false);
    setStrokeCount(0);
    privateUndoStackRef.current = [];
    lastCommunityStrokeIdRef.current = null;
  };

  const handleUndo = async () => {
    if (isCommunityMode) {
      if (!lastCommunityStrokeIdRef.current || strokeCount === 0) {
        showToast("You haven't drawn a stroke to undo yet.");
        return;
      }
      try {
        const idToDelete = lastCommunityStrokeIdRef.current;
        await fetch(`/api/strokes?id=${idToDelete}`, { method: 'DELETE' });
        lastCommunityStrokeIdRef.current = null;
        setStrokeCount(0);
        showToast("Stroke undone. You have 1 stroke remaining.");
        
        localStrokesRef.current = localStrokesRef.current.filter(s => s.id !== idToDelete);
        redrawCanvas();
      } catch (e) {
        console.error("Undo failed", e);
      }
    } else {
      if (privateUndoStackRef.current.length === 0) {
        showToast("Nothing to undo.");
        return;
      }
      const snapshot = privateUndoStackRef.current.pop();
      const ctx = canvasRef.current.getContext('2d');
      const img = new window.Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = snapshot;
      setStrokeCount(Math.max(0, strokeCount - 1));
      showToast("Stroke undone.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommunityMode, strokeCount]);

  const getArtistLabel = () => {
    const trimmed = artistName.trim();
    if (!trimmed || trimmed.toLowerCase() === 'guest artist') {
      return 'Anonymous Activist';
    }
    return trimmed;
  };

  const saveToGallery = () => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const artistLabel = getArtistLabel();

    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = {
      id: Date.now(),
      title: `${artistLabel}'s work`,
      author: artistLabel,
      dataUrl,
      createdAt: new Date().toLocaleDateString(),
    };

    const next = [entry, ...existing].slice(0, 18);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStatus('Saved to gallery.');
    setIsSaved(true);
  };

  const exportImage = async (action) => {
    if (typeof window === 'undefined') return;

    setShowExportMenu(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const instaCanvas = document.createElement('canvas');
    const size = Math.max(canvas.width, canvas.height);
    instaCanvas.width = size;
    instaCanvas.height = size + 60;
    const ctx = instaCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090909';
    ctx.fillRect(0, 0, instaCanvas.width, instaCanvas.height);

    const offsetX = (size - canvas.width) / 2;
    const offsetY = (size - canvas.height) / 2;
    ctx.drawImage(canvas, offsetX, offsetY);

    const artistLabel = getArtistLabel();
    ctx.textAlign = 'right';
    ctx.font = 'bold 28px "Courier New", Courier, monospace';
    ctx.fillStyle = '#FF2A2A';
    ctx.fillText(`ARTIST: ${artistLabel.toUpperCase()}`, instaCanvas.width - 20, instaCanvas.height - 30);

    ctx.font = 'bold 16px "Courier New", Courier, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('#WAKEUPINDIA', instaCanvas.width - 20, instaCanvas.height - 10);

    try {
      const blob = await new Promise((resolve, reject) => {
        instaCanvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error('Canvas export failed.'));
        }, 'image/png');
      });

      const fileName = `wakeupindia-${artistLabel.toLowerCase().replace(/\s+/g, '-')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (action === 'share') {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Wake Up India',
            text: 'Join the movement at Wake Up India.',
          });
          setStatus('Shared to Apps.');
        } else {
          alert("Native sharing is not available on your device. Please use 'Download' instead.");
          setStatus('Share unsupported.');
        }
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setStatus('Image downloaded.');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      setStatus('Export cancelled/failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col font-sans select-none overflow-hidden text-white">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 bg-[#FF2A2A] px-2 sm:px-4 py-2 text-black text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-[0_2px_0_#8B0000] relative w-full overflow-hidden">
        <Link href="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
          <img src="/logo.png" className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0" alt="icon" onError={(e) => e.target.style.display = 'none'} />
          <span className="truncate">{isCommunityMode ? 'Community Paint - Live' : 'Private Studio - WakeUpIndia'}</span>
        </Link>
        {isCommunityMode && (
          <span className="ml-1 sm:ml-4 flex items-center gap-1 animate-pulse border-l-2 border-black pl-1 sm:pl-4 whitespace-nowrap flex-shrink-0">
            <Users size={12} className="sm:w-[14px] sm:h-[14px]" /> {liveUsers} LIVE
          </span>
        )}
        <div className="ml-auto flex-shrink-0 pl-2">
           <Link href="/" className="bg-black text-[#FF2A2A] px-2 sm:px-3 py-1 font-bold border-2 border-black hover:bg-transparent hover:text-black transition-colors shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
             HOME
           </Link>
        </div>
      </div>
      
      {toastMessage && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-[#111] border-2 border-[#FF2A2A] text-white px-6 py-3 shadow-[8px_8px_0_rgba(255,42,42,0.8)] font-mono text-sm flex items-center gap-3 animate-pulse">
          <span className="text-[#FF2A2A] font-bold text-lg">!</span>
          {toastMessage}
        </div>
      )}
      
      {/* Action Bar (Replaces fake menu) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-1 sm:gap-4 px-1 sm:px-4 py-1.5 sm:py-3 bg-[#111] border-b-2 border-[#333] text-[9px] sm:text-xs font-bold uppercase tracking-widest relative z-[60] shadow-[0_4px_10px_rgba(0,0,0,0.5)] w-full overflow-visible">
        <div className="flex items-center bg-black border-2 border-[#333] shadow-[2px_2px_0_#222] min-w-0 px-1">
          <span className="text-[#FF2A2A] hidden sm:inline mr-2">Target:</span>
          <select 
            value={selectedTemplate} 
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="bg-transparent text-white w-full outline-none py-1 sm:py-1.5 cursor-pointer text-[10px] sm:text-xs truncate"
          >
            {templates.map(t => <option key={t.src} value={t.src} className="bg-[#111] text-white">{t.name}</option>)}
          </select>
        </div>

        <div className="flex items-center bg-black border-2 border-[#333] shadow-[2px_2px_0_#222] min-w-0 px-1">
          <span className="text-[#FF2A2A] hidden sm:inline mr-2">Alias:</span>
          <input 
            type="text" 
            value={artistName} 
            onChange={e => { setArtistName(e.target.value); setIsSaved(false); }}
            className="bg-transparent text-white w-full outline-none py-1 sm:py-1.5 text-[10px] sm:text-xs placeholder-[#666]"
            placeholder="Artist Alias"
          />
        </div>

        <div className="flex items-center bg-black border-2 border-[#333] shadow-[2px_2px_0_#222] min-w-0 px-1">
          <span className="text-[#FF2A2A] hidden sm:inline mr-2">Brush Size:</span>
          <span className="text-[#FF2A2A] sm:hidden text-[8px] mr-1 font-bold">BRUSH:</span>
          <select 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="bg-transparent text-white w-full outline-none py-1 sm:py-1.5 cursor-pointer text-[10px] sm:text-xs truncate"
          >
            <option value="2" className="bg-[#111] text-white">Smallest</option>
            <option value="5" className="bg-[#111] text-white">Small</option>
            <option value="10" className="bg-[#111] text-white">Medium</option>
            <option value="20" className="bg-[#111] text-white">Large</option>
            <option value="30" className="bg-[#111] text-white">Largest</option>
          </select>
        </div>

        {tool === 'text' && (
          <div className="flex items-center bg-black border-2 border-[#FF2A2A] shadow-[2px_2px_0_#8B0000] min-w-0 px-1 col-span-2 sm:col-span-1 mt-0.5 sm:mt-0">
             <span className="text-white hidden sm:inline mr-2">Text:</span>
             <input 
               value={textInput} 
               onChange={e => setTextInput(e.target.value)} 
               className="bg-transparent text-white w-full outline-none py-1 sm:py-1.5 text-[10px] sm:text-xs placeholder-[#666]" 
               placeholder="Type text..."
               maxLength={20}
             />
          </div>
        )}

        {tool === 'sticker' && (
          <div className="flex items-center gap-1 bg-black border-2 border-[#FF2A2A] shadow-[2px_2px_0_#8B0000] min-w-0 px-1 py-0.5 col-span-2 sm:col-span-1 mt-0.5 sm:mt-0 relative">
             <span className="text-white hidden sm:inline">Emoji:</span>
             <input 
               value={selectedSticker} 
               readOnly
               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
               className="bg-transparent text-white w-full text-center outline-none cursor-pointer text-sm sm:text-xl flex-1" 
             />
             <button 
               onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
               className="bg-[#333] text-white px-2 py-1 text-[9px] sm:text-xs font-bold border border-black shadow-[1px_1px_0_#111] hover:bg-[#444] whitespace-nowrap"
             >
               PICK
             </button>
             
             {showEmojiPicker && (
               <div className="absolute top-10 sm:top-12 left-0 sm:left-auto mt-2 z-50 shadow-[4px_4px_10px_rgba(0,0,0,0.8)] border-4 border-[#333] max-w-[95vw]">
                 <EmojiPicker 
                   theme="dark" 
                   width={300}
                   height={400}
                   onEmojiClick={(emojiData) => {
                     setSelectedSticker(emojiData.emoji);
                     setShowEmojiPicker(false);
                   }} 
                 />
               </div>
             )}
          </div>
        )}

        <div className="col-span-2 sm:col-span-1 ml-0 sm:ml-auto flex justify-between sm:justify-start gap-1 sm:gap-3 relative w-full sm:w-auto mt-0.5 sm:mt-0">
          <button onClick={saveToGallery} className="flex-1 sm:flex-none justify-center bg-white text-black px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-black shadow-[2px_2px_0_#999] sm:shadow-[3px_3px_0_#999] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs whitespace-nowrap">
            SHARE <span className="hidden sm:inline">PUBLIC</span>
          </button>
          <div className="relative flex-1 sm:flex-none">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              className="w-full justify-center bg-[#FF2A2A] text-black px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-black shadow-[2px_2px_0_#8B0000] sm:shadow-[3px_3px_0_#8B0000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs whitespace-nowrap"
            >
              <Download size={14} className="hidden sm:block" /> EXPORT
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-3 bg-black border-2 border-[#FF2A2A] shadow-[4px_4px_0_#8B0000] z-50 flex flex-col w-[200px] sm:w-[240px]">
                <button 
                  onClick={() => exportImage('download')} 
                  className="px-4 py-3 text-white text-left font-bold border-b border-[#333] hover:bg-[#111] hover:text-[#FF2A2A] transition-colors"
                >
                  ⬇️ Download
                </button>
                <button 
                  onClick={() => exportImage('share')} 
                  className="px-4 py-3 text-white text-left font-bold hover:bg-[#111] hover:text-[#FF2A2A] transition-colors"
                >
                  📱 Share Apps
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-1 min-h-0 bg-[#050505] relative z-0">
        {/* Toolbar (Bottom on mobile, Left on desktop) */}
        <div className="order-last sm:order-first w-full sm:w-16 bg-[#111] border-t-2 sm:border-t-0 sm:border-r-2 border-[#333] p-1.5 sm:p-2 flex flex-col items-stretch gap-1.5 sm:gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.5)] sm:shadow-[4px_0_10px_rgba(0,0,0,0.5)] z-10">
          
          <div className="grid grid-cols-5 sm:flex sm:flex-col gap-1.5 sm:gap-2">
            <button onClick={() => setTool('brush')} className={`w-full aspect-square sm:aspect-auto sm:w-12 sm:h-12 flex items-center justify-center border-2 transition-all text-sm sm:text-xl shrink-0 ${tool === 'brush' ? 'border-[#FF2A2A] bg-black text-[#FF2A2A] shadow-[inset_0_0_5px_rgba(255,42,42,0.5)]' : 'border-[#333] bg-transparent text-white hover:border-[#666]'}`} title="Brush">🖌️</button>
            <button onClick={() => setTool('spray')} className={`w-full aspect-square sm:aspect-auto sm:w-12 sm:h-12 flex items-center justify-center border-2 transition-all text-sm sm:text-xl shrink-0 ${tool === 'spray' ? 'border-[#FF2A2A] bg-black text-[#FF2A2A] shadow-[inset_0_0_5px_rgba(255,42,42,0.5)]' : 'border-[#333] bg-transparent text-white hover:border-[#666]'}`} title="Spray">💨</button>
            <button onClick={() => setTool('eraser')} className={`w-full aspect-square sm:aspect-auto sm:w-12 sm:h-12 flex items-center justify-center border-2 transition-all text-sm sm:text-xl shrink-0 ${tool === 'eraser' ? 'border-[#FF2A2A] bg-black text-[#FF2A2A] shadow-[inset_0_0_5px_rgba(255,42,42,0.5)]' : 'border-[#333] bg-transparent text-white hover:border-[#666]'}`} title="Eraser">🧹</button>
            <button onClick={() => setTool('text')} className={`w-full aspect-square sm:aspect-auto sm:w-12 sm:h-12 flex items-center justify-center border-2 transition-all text-sm sm:text-xl shrink-0 font-bold font-serif ${tool === 'text' ? 'border-[#FF2A2A] bg-black text-[#FF2A2A] shadow-[inset_0_0_5px_rgba(255,42,42,0.5)]' : 'border-[#333] bg-transparent text-white hover:border-[#666]'}`} title="Text">T</button>
            <button onClick={() => setTool('sticker')} className={`w-full aspect-square sm:aspect-auto sm:w-12 sm:h-12 flex items-center justify-center border-2 transition-all text-sm sm:text-xl shrink-0 ${tool === 'sticker' ? 'border-[#FF2A2A] bg-black text-[#FF2A2A] shadow-[inset_0_0_5px_rgba(255,42,42,0.5)]' : 'border-[#333] bg-transparent text-white hover:border-[#666]'}`} title="Stickers">⭐</button>
          </div>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-col gap-1.5 sm:gap-2 sm:mt-auto">
            <button onClick={handleUndo} className="w-full py-2 sm:h-auto sm:w-full text-[10px] sm:text-xs font-bold tracking-widest border-2 border-[#333] bg-transparent sm:py-3 text-white hover:bg-black hover:text-[#FF2A2A] transition-colors">UNDO</button>
            <button onClick={clearCanvas} className="w-full py-2 sm:h-auto sm:w-full text-[10px] sm:text-xs font-bold tracking-widest border-2 border-[#333] bg-transparent sm:py-3 text-white hover:bg-[#FF2A2A] hover:text-black transition-colors">CLEAR</button>
          </div>
          
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-[#000] p-2 sm:p-6 relative flex justify-center items-center shadow-[inset_0_0_40px_rgba(255,42,42,0.05)]">
          {/* Gritty Noise Overlay for Canvas Container */}
          <div 
            className="pointer-events-none absolute inset-0 opacity-20 z-10" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          ></div>
          <div className="bg-black border-2 sm:border-4 border-[#1A1A1A] shadow-[8px_8px_0_#FF2A2A] sm:shadow-[12px_12px_0_#FF2A2A] relative z-20 w-full h-full max-w-[1400px] max-h-[900px] overflow-hidden flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className={`block max-w-full max-h-full touch-none bg-black ${tool === 'spray' ? 'cursor-cell' : 'cursor-crosshair'}`}
                style={{ aspectRatio: '900 / 600' }}
                onPointerDown={startDrawing}
                onPointerMove={continueDrawing}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Color Palette */}
      <div className="h-16 sm:h-24 bg-[#111] border-t-2 border-[#333] shrink-0 flex items-center justify-between sm:justify-start px-2 sm:px-4 gap-2 sm:gap-8 shadow-[0_-4px_10px_rgba(0,0,0,0.5)] relative z-10">
        <div className="flex items-center gap-2 sm:gap-6 bg-black border-2 border-[#333] p-1.5 sm:p-3 shadow-[2px_2px_0_#222] sm:shadow-[4px_4px_0_#222]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#555] relative flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]" style={{ backgroundColor: color }}>
            <input type="color" value={color} onChange={(e) => {setColor(e.target.value); if (tool === 'eraser') setTool('brush');}} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" title="Custom color" />
          </div>
          <span className="sm:hidden text-white font-bold text-[10px] uppercase ml-1 mr-2">Color</span>
          
          <div className="hidden sm:flex flex-wrap gap-2 max-w-[500px]">
            {palette.concat(['#FFF', '#CCC', '#808080', '#000080', '#008000', '#800080', '#008080', '#808000', '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#0000FF', '#FF0000', '#800000', '#111']).slice(0, 24).map((swatch, idx) => (
              <button key={idx} onClick={() => {setColor(swatch); if (tool === 'eraser') setTool('brush');}} className={`w-8 h-8 border-2 transition-transform hover:scale-110 ${color === swatch ? 'border-white shadow-[0_0_8px_rgba(255,255,255,0.6)] z-10 relative' : 'border-[#333]'}`} style={{ backgroundColor: swatch }}></button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col text-right gap-0 sm:gap-1 pr-1 sm:pr-4">
          <span className="text-[#FF2A2A] font-bold text-[10px] sm:text-xs uppercase tracking-widest border-b border-[#333] pb-0.5 sm:pb-1 mb-0.5 sm:mb-1">Status Log</span>
          <span className="text-[9px] sm:text-sm font-mono text-[#999]">{status}</span>
        </div>
      </div>
    </div>
  );
}
