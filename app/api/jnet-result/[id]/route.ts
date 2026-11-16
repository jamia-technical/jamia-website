import { NextResponse } from 'next/server';
import { jnetResultService } from '../../../../lib/services/jnetResultService';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const result = jnetResultService.findById(id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching JNET result:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
