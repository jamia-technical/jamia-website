import { NextResponse } from 'next/server';
import { contactService } from "../../../../lib/services/contactService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const contactId = parseInt(params.id, 10);

  if (Number.isNaN(contactId)) {
    return NextResponse.json(
      { success: false, message: "Invalid contact ID" },
      { status: 400 }
    );
  }

  try {
    const contact = await contactService.getAllContacts();
    const found = contact.find((c: any) => c.id === contactId);

    if (!found) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: found },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const contactId = parseInt(params.id, 10);

  if (Number.isNaN(contactId)) {
    return NextResponse.json(
      { success: false, message: "Invalid contact ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { status } = body;
    const allowedStatuses = ["new", "read", "closed"] as const;
    
    if (!status || !allowedStatuses.includes(status as any)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await contactService.updateContactStatus(contactId, status === 'read' ? 'read' : 'unread');

    return NextResponse.json(
      { success: true, message: "Status updated successfully", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating contact status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const contactId = parseInt(params.id, 10);

  if (Number.isNaN(contactId)) {
    return NextResponse.json(
      { success: false, message: "Invalid contact ID" },
      { status: 400 }
    );
  }

  try {
    await contactService.deleteContact(contactId);
    return NextResponse.json(
      { success: true, message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
