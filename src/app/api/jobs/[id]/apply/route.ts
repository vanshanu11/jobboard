import { NextResponse } from "next/server";
import formidable from "formidable';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/s3';

export const runtime = 'edge' in globalThis ? 'edge' : undefined; // placeholder

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const form = formidable({ multiples: false });
    const parsed = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });
    // @ts-ignore
    const { fields, files } = parsed;
    const name = fields.name as string;
    const email = fields.email as string;
    const message = fields.message as string;
    // @ts-ignore
    const resume = files.resume;
    let resumeUrl = null;
    if (resume && resume.filepath) {
      const data = fs.readFileSync((resume as any).filepath);
      const key = `resumes/${Date.now()}-${(resume as any).originalFilename}`;
      resumeUrl = await uploadFile(data, key, (resume as any).mimetype);
    }
    await prisma.application.create({ data: { jobId: params.id, name, email, message, resumeUrl, candidateId: "" } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
