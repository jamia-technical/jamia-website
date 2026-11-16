import { NextResponse } from 'next/server';
import { contactService } from "../../../lib/services/contactService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, subject and message are required." },
        { status: 400 }
      );
    }

    const contact = await contactService.createContact({ name, email, phone, subject, message });

    return NextResponse.json(
      { success: true, message: "Message saved successfully.", data: contact },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const contacts = await contactService.getAllContacts();
    return NextResponse.json(
      { success: true, data: contacts },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
