import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobCreateSchema } from "@/lib/validators";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const page = Number(url.searchParams.get("page") || "1");
  const take = 10;
  const where: any = { status: "APPROVED" };
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { location: { contains: q, mode: "insensitive" } }];
  if (type) where.type = type;
  const jobs = await prisma.job.findMany({ where, skip: (page-1)*take, take, orderBy: { createdAt: "desc" } });
  const total = await prisma.job.count({ where });
  return NextResponse.json({ jobs, total });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const role = (session as any).role;
  if (role !== "EMPLOYER" && role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = jobCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const data = parsed.data;
    // jobs by employers default to PENDING for moderation; admin jobs auto-approve
    const status = role === "ADMIN" ? "APPROVED" : "PENDING";
    const job = await prisma.job.create({ data: { ...data, employerId: (session as any).userId, status } });
    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
