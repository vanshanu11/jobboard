import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const { name, email, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "email exists" }, { status: 400 });
    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
