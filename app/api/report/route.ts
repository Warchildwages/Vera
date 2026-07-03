import { NextRequest, NextResponse } from 'next/server';
import { submitReputation } from '../../../lib/reputation';
import { ReportSchema } from '../../../lib/schemas';

/**
 * POST /api/report — Submit a reputation event
 *
 * Foreign agents, users, and other verifiers use this to report
 * transaction outcomes, disputes, and problems to Vera.
 * All submissions are validated with Zod before processing.
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = ReportSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', detail: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const body = {
      ...parsed.data,
      eventId: parsed.data.eventId || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: parsed.data.timestamp || new Date().toISOString(),
    };

    submitReputation(body);

    return NextResponse.json({
      accepted: true,
      eventId: body.eventId,
      agentId: body.agentId,
      detail: 'Reputation event recorded. Vera will index this for future queries.',
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'REPORT_FAILED', detail: (e as Error).message },
      { status: 400 },
    );
  }
}
