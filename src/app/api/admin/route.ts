import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session || (session as any).role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
  const jobs = await prisma.job.findMany({ include: { employer: true } , orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ users, jobs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session as any).role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  // actions: approveJob, rejectJob, setRole
  if (body.action === 'approveJob') {
    await prisma.job.update({ where: { id: body.jobId }, data: { status: 'APPROVED' } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'rejectJob') {
    await prisma.job.update({ where: { id: body.jobId }, data: { status: 'REJECTED' } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'setRole') {
    await prisma.user.update({ where: { id: body.userId }, data: { role: body.role } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'invalid' }, { status: 400 });
}
