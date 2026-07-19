import { NextResponse } from 'next/server';

// In-memory store for strokes
let strokes = [];

// Track active clients (clientId -> lastSeen timestamp)
const activeClients = {};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const since = parseInt(searchParams.get('since') || '0', 10);
  const clientId = searchParams.get('clientId');
  
  const now = Date.now();

  // Register or update this client's last seen time
  if (clientId) {
    activeClients[clientId] = now;
  }

  // Calculate live users (clients seen in the last 10 seconds)
  let liveUsers = 0;
  for (const [id, lastSeen] of Object.entries(activeClients)) {
    if (now - lastSeen < 10000) {
      liveUsers++;
    } else {
      delete activeClients[id]; // Cleanup stale clients
    }
  }
  
  // Return strokes newer than the 'since' timestamp
  const newStrokes = strokes.filter(s => s.timestamp > since);
  
  return NextResponse.json({ strokes: newStrokes, liveUsers });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Create a new stroke record
    const newStroke = {
      id: Date.now() + Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      tool: body.tool || 'brush',
      color: body.color || '#FF2A2A',
      size: body.size || 4,
      points: body.points || [],
      text: body.text || '',
    };

    strokes.push(newStroke);
    
    // Prevent the array from growing infinitely
    if (strokes.length > 500) {
      strokes = strokes.slice(-500);
    }

    return NextResponse.json({ success: true, stroke: newStroke });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const strokeId = searchParams.get('id');
    
    if (!strokeId) {
      return NextResponse.json({ success: false, error: 'Missing stroke id' }, { status: 400 });
    }

    strokes = strokes.filter(s => s.id !== strokeId);

    // Add a deletion marker so other clients can erase it
    strokes.push({
      id: Date.now() + Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      type: 'undo',
      targetId: strokeId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}
