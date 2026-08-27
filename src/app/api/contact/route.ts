import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { ContactPayload } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!name || !message || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Name, a valid email and a message are required." },
      { status: 422 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] RESEND_API_KEY/CONTACT_TO_EMAIL not set — message logged instead:", {
        name,
        email,
        message,
      });
      return NextResponse.json({ id: "dev-noop" });
    }
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Portfolio message from ${name}`,
    text: [
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Source:  ${payload.source ?? "form"}`,
      "",
      message,
    ].join("\n"),
  });

  if (error) {
    console.error("[contact] resend error", error);
    return NextResponse.json({ error: "Could not send the message." }, { status: 502 });
  }

  return NextResponse.json({ id: data?.id ?? "" });
}
