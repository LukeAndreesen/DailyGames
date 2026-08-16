import { ingestRequestSchema, ingestScore, secretsMatch } from "@/lib/ingestion";

export async function POST(request: Request) {
  const secret = process.env.INGEST_SECRET;
  if (!secret || !secretsMatch(request.headers.get("authorization"), secret)) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 25_000) {
    return Response.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = ingestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "INVALID_PAYLOAD", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const outcome = await ingestScore(parsed.data);
    const status =
      outcome.status === "event_id_conflict"
        ? 409
        : outcome.ok
          ? 200
          : 422;
    return Response.json(outcome, { status });
  } catch (error) {
    console.error("Score ingestion failed", error);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
