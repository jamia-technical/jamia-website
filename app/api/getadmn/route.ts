import { NextResponse } from 'next/server';
import { admissionService } from "../../../lib/services/admissionService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, whatsapp, stream, place, district, state, level } = body;

    if (!name || !whatsapp || !stream) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, whatsapp, or stream" },
        { status: 400 }
      );
    }

    const admission = await admissionService.createAdmission({ 
      name, whatsapp, stream, place, district, state, level 
    });

    return NextResponse.json(
      { success: true, message: "Application submitted successfully", data: admission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const admissions = await admissionService.getAllAdmissions();
    return NextResponse.json(
      { success: true, data: admissions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admissions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required for deletion" },
        { status: 400 }
      );
    }
    await admissionService.deleteAdmission(id);
    return NextResponse.json(
      { success: true, message: "Admission deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admission:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
