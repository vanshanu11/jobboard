# JobBoard Upgraded - scaffold

Contains RBAC, file uploads (S3/local), admin moderation, search & pagination, resume uploads, and email scaffolding.

Quickstart:
- copy .env.example to .env and fill keys (DATABASE_URL, NEXTAUTH_SECRET, AWS_S3_BUCKET optional, RESEND_API_KEY optional)
- npm install
- npx prisma migrate dev --name init
- npm run prisma:seed
- npm run dev

Docker-compose and other files can be added similarly to previous scaffold.

Deployment Guide – Job Board (Next.js + Prisma +
NextAuth)
1. Prerequisites
- Git, Node.js (v18+), npm or yarn
- Docker & Docker Compose
- PostgreSQL (local via Docker or cloud DB like RDS/Supabase/Neon)
- AWS S3 bucket (for resumes/logos) – optional, local fallback works
- Resend account (for emails) – optional
- Vercel account (for deployment)
2. Environment Variables
Create `.env` file at project root:
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/jobboard"
NEXTAUTH_SECRET="super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="my-jobboard-bucket"
AWS_ACCESS_KEY_ID="xxxx"
AWS_SECRET_ACCESS_KEY="xxxx"
RESEND_API_KEY="re_xxxxx"
3. Local Development (with Docker)
1. Start services:
docker-compose up --build
2. Run migrations + seed data:
docker exec -it jobboard-web npx prisma migrate deploy
docker exec -it jobboard-web npm run prisma:seed
3. Open http://localhost:3000
Demo accounts (from seed):
- Admin → admin@jobboard.dev / password123
- Employer → employer@jobboard.dev / password123
- Candidate → candidate@jobboard.dev / password123
4. Production Deployment (Vercel + Managed DB)
1. Push code to GitHub/GitLab.
2. Import project in Vercel.
3. Configure environment variables in Vercel dashboard.
4. Use a managed PostgreSQL (Supabase/Neon/RDS).
5. Run migrations:
npx prisma migrate deploy
6. Upload handling:
- Enable S3 and configure credentials in `.env`.
- Without S3 → resumes/logos stored locally (not recommended).
7. Emails:
- Add RESEND_API_KEY in Vercel settings.
5. Roles & Access
- Admin: approve/reject jobs, manage users, delete jobs.
- Employer: post/edit/delete jobs, view applicants.
- Candidate: apply for jobs, upload resume.
6. Security Best Practices
- Use strong NEXTAUTH_SECRET.
- Never commit .env file.
- Always use HTTPS in production.
- Configure least-privilege IAM for AWS S3.
7. Future Enhancements
- Presigned S3 uploads.
- CI/CD pipeline with GitHub Actions.
- Monitoring (Prometheus + Grafana, or Vercel Analytics).
- Cost monitoring (FinOps).
