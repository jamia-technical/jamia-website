import { NextResponse } from 'next/server';
import { admissionService } from "../../../../lib/services/admissionService";
import prisma from '../../../../utils/prisma';
import { getLevelByStreamServer as getLevelByStream } from '../../../../lib/streamUtils';

/**
 * Auto-assign an applicant to the next panel in round-robin order.
 * Given 5 panels and 50 applicants:
 *   Panel 1: #1, #6, #11, #16...
 *   Panel 2: #2, #7, #12, #17...
 *   etc.
 */
async function autoAssignToPanel(admissionId: number): Promise<{ assigned: boolean; noPanels?: boolean; panelName?: string }> {
  // Check if already assigned
  const existing = await prisma.panel_assignment.findUnique({
    where: { admission_id: admissionId },
  });
  if (existing) {
    return { assigned: true, panelName: 'already assigned' };
  }

  // Get the applicant to determine their level + stream
  const admission = await prisma.admissions.findUnique({
    where: { id: admissionId },
  });
  if (!admission) {
    return { assigned: false };
  }

  const level = getLevelByStream(admission.stream);
  
  // For levels with specific streams (8, 11, Degree), match on stream
  // For Rabbani, stream is null in the panel
  const matchingPanels = await prisma.panel.findMany({
    where: level === 'Rabbani'
      ? { level: 'Rabbani' }
      : { level, stream: admission.stream },
    orderBy: { id: 'asc' },
  });

  if (matchingPanels.length === 0) {
    return { assigned: false, noPanels: true };
  }

  // Find the last assignment across these panels to determine next panel
  const panelIds = matchingPanels.map((p) => p.id);
  const lastAssignment = await prisma.panel_assignment.findFirst({
    where: { panel_id: { in: panelIds } },
    orderBy: { assigned_at: 'desc' },
  });

  let nextPanelId: number;
  if (!lastAssignment) {
    // No assignments yet → assign to the first panel
    nextPanelId = matchingPanels[0].id;
  } else {
    // Find the index of the last assigned panel and pick the next one (round-robin)
    const lastIndex = matchingPanels.findIndex((p) => p.id === lastAssignment.panel_id);
    const nextIndex = (lastIndex + 1) % matchingPanels.length;
    nextPanelId = matchingPanels[nextIndex].id;
  }

  // Create the assignment
  await prisma.panel_assignment.create({
    data: {
      panel_id: nextPanelId,
      admission_id: admissionId,
    },
  });

  const assignedPanel = matchingPanels.find((p) => p.id === nextPanelId);
  return { assigned: true, panelName: assignedPanel?.name };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const admission = await prisma.admissions.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id) : id },
      include: { exam_results: true, panel_assignment: { include: { panel: true } } }
    });
    if (!admission) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: admission }, { status: 200 });
  } catch (error: any) {
    console.error("ADMISSION GET ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await req.json();
    const admissionId = typeof id === 'string' ? parseInt(id) : id;
    const skipPanelAssign = body.skipPanelAssign;
    delete body.skipPanelAssign;

    // If the request contains exam_results, handle separately
    if (body.exam_results) {
      const examData = body.exam_results;

      await prisma.exam_results.upsert({
        where: { admission_id: admissionId },
        update: {
          islamic_knowledge: examData.islamic_knowledge,
          science_aptness: examData.science_aptness,
          communication: examData.communication,
          general_awareness: examData.general_awareness,
          achievements: examData.achievements,
          leadership: examData.leadership,
          interpersonal: examData.interpersonal,
          written_test: examData.written_test,
          updated_at: new Date(),
        },
        create: {
          admission_id: admissionId,
          islamic_knowledge: examData.islamic_knowledge,
          science_aptness: examData.science_aptness,
          communication: examData.communication,
          general_awareness: examData.general_awareness,
          achievements: examData.achievements,
          leadership: examData.leadership,
          interpersonal: examData.interpersonal,
          written_test: examData.written_test,
        },
      });

      // Remove exam_results from body before updating admissions
      delete body.exam_results;
    }

    // Auto-assign to panel when fee is being marked as paid
    let panelResult: { assigned: boolean; noPanels?: boolean; panelName?: string } | null = null;
    if (body.fee_done === true && !skipPanelAssign) {
      panelResult = await autoAssignToPanel(admissionId);
      
      // If no panels exist, return early with noPanels flag
      // The frontend will show a modal asking admin to skip or create a panel
      if (panelResult.noPanels) {
        return NextResponse.json({
          success: true,
          noPanels: true,
          message: 'No panels found for this stream. Create panels first or skip assignment.',
        }, { status: 200 });
      }
    }

    // Update the admission record (flags + any other fields)
    let updatedAdmission;
    const remainingKeys = Object.keys(body);
    if (remainingKeys.length > 0) {
      updatedAdmission = await admissionService.updateAdmission(id, body);
    }

    // Fetch fresh data with exam_results and panel_assignment included
    const fullData = await prisma.admissions.findUnique({
      where: { id: admissionId },
      include: {
        exam_results: true,
        panel_assignment: { include: { panel: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: fullData,
      panelAssigned: panelResult?.assigned || false,
      panelName: panelResult?.panelName || null,
    }, { status: 200 });
  } catch (error: any) {
    console.error("ADMISSION UPDATE ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
