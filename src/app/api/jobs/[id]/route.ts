import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { jobCreateSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({ where: { id: params.id }, include: { applications: { orderBy: { createdAt: "desc" } } } });
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
  const role = (session as any).role;
  if (role !== "ADMIN" && job.employerId !== (session as any).userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = jobCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const updated = await prisma.job.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
  const role = (session as any).role;
  if (role !== "ADMIN" && job.employerId !== (session as any).userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
