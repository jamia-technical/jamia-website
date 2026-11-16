import { NextResponse } from 'next/server';
import prisma from '../../../../utils/prisma';

// DELETE a panel by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid panel ID' },
        { status: 400 }
      );
    }

    // Cascade delete will also remove all panel_assignments
    await prisma.panel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PANEL DELETE ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
