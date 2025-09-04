# JobBoard Upgraded - scaffold

Contains RBAC, file uploads (S3/local), admin moderation, search & pagination, resume uploads, and email scaffolding.

Quickstart:
- copy .env.example to .env and fill keys (DATABASE_URL, NEXTAUTH_SECRET, AWS_S3_BUCKET optional, RESEND_API_KEY optional)
- npm install
- npx prisma migrate dev --name init
- npm run prisma:seed
- npm run dev

Docker-compose and other files can be added similarly to previous scaffold.
