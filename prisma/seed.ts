import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const adminPw = await bcrypt.hash("adminpass", 10);
  const employerPw = await bcrypt.hash("employerpass", 10);
  const candidatePw = await bcrypt.hash("candidatepass", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@jobboard.dev" },
    update: {},
    create: { email: "admin@jobboard.dev", name: "Admin", passwordHash: adminPw, role: "ADMIN" }
  });
  const employer = await prisma.user.upsert({
    where: { email: "employer@jobboard.dev" },
    update: {},
    create: { email: "employer@jobboard.dev", name: "Employer", passwordHash: employerPw, role: "EMPLOYER" }
  });
  const candidate = await prisma.user.upsert({
    where: { email: "candidate@jobboard.dev" },
    update: {},
    create: { email: "candidate@jobboard.dev", name: "Candidate", passwordHash: candidatePw, role: "CANDIDATE" }
  });

  await prisma.job.createMany({
    data: [
      {
        title: "Senior DevOps Engineer",
        company: "TechCorp",
        description: "Manage Kubernetes, build CI/CD and infra as code.",
        type: "FULL_TIME",
        location: "Remote",
        status: "APPROVED",
        employerId: employer.id,
        salaryMin: 1500000,
        salaryMax: 2500000
      },
      {
        title: "React Developer",
        company: "WebWorks",
        description: "Build modern web UIs with React and Next.js.",
        type: "HYBRID",
        location: "Bengaluru, IN",
        status: "APPROVED",
        employerId: employer.id,
        salaryMin: 1200000,
        salaryMax: 2000000
      }
    ]
  });
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
