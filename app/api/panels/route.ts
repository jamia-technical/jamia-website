import { NextResponse } from 'next/server';
import prisma from '../../../utils/prisma';

// GET all panels with their assignments (including admission data)
export async function GET() {
  try {
    const panels = await prisma.panel.findMany({
      orderBy: { id: 'asc' },
      include: {
        assignments: {
          include: {
            admission: true,
          },
          orderBy: { assigned_at: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: panels }, { status: 200 });
  } catch (error: any) {
    console.error('PANELS GET ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - create a new panel
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, level, stream } = body;

    if (!name || !level) {
      return NextResponse.json(
        { success: false, error: 'Name and level are required' },
        { status: 400 }
      );
    }

    const panel = await prisma.panel.create({
      data: {
        name,
        level,
        stream: stream || null,
      },
    });

    return NextResponse.json({ success: true, data: panel }, { status: 201 });
  } catch (error: any) {
    console.error('PANEL CREATE ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
