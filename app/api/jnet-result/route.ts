import { NextResponse } from 'next/server';
import { jnetResultService } from '../../../lib/services/jnetResultService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { admission_no, dob } = body;

    if (!admission_no || !dob) {
      return NextResponse.json(
        { success: false, error: "Admission number and date of birth are required" },
        { status: 400 }
      );
    }

    const result = jnetResultService.findByCredentials(admission_no.trim(), dob);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "No matching record found. Please check your admission number and date of birth." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { id: result.Application_no } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error looking up JNET result:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", message: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
