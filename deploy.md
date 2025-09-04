deploys the upgraded Job Board on a Linux server (Ubuntu/Debian based).

This script will:

Install dependencies (Docker, Docker Compose, Node.js, PostgreSQL client).

Clone your project repo (or unzip if you upload manually).

Configure environment variables (.env).

Start Docker containers (Postgres + Next.js).

Run Prisma migrations & seed data.

Configure systemd service for auto-restart.

🚀 Deployment Script (deploy_jobboard.sh)
#!/bin/bash
set -e

APP_NAME="jobboard"
APP_DIR="/opt/$APP_NAME"
REPO_URL="https://github.com/your-username/jobboard-upgraded.git"   # change if needed
NODE_VERSION="18.x"

echo "=== 🚀 Starting deployment of $APP_NAME ==="

# Update system
sudo apt update -y && sudo apt upgrade -y

# Install dependencies
echo "=== 📦 Installing dependencies ==="
sudo apt install -y curl git unzip postgresql-client

# Install Docker
if ! command -v docker &> /dev/null
then
  echo "=== 🐳 Installing Docker ==="
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null
then
  echo "=== 🔧 Installing Docker Compose ==="
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Clone project (if not already exists)
if [ ! -d "$APP_DIR" ]; then
  echo "=== 📂 Cloning repository ==="
  sudo git clone $REPO_URL $APP_DIR
fi

cd $APP_DIR

# Copy environment variables
if [ ! -f ".env" ]; then
  echo "=== ⚙️ Creating .env file ==="
  cp .env.example .env
  echo "👉 Please edit $APP_DIR/.env with your secrets before running containers."
fi

# Start Docker services
echo "=== 🐳 Starting containers ==="
sudo docker-compose up -d --build

# Run migrations
echo "=== 📜 Running Prisma migrations ==="
sudo docker exec -it ${APP_NAME}-web npx prisma migrate deploy

# Seed database
echo "=== 🌱 Seeding database ==="
sudo docker exec -it ${APP_NAME}-web npm run prisma:seed

# Setup systemd service for auto-restart
SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"

if [ ! -f "$SERVICE_FILE" ]; then
  echo "=== ⚡ Creating systemd service ==="
  sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=Job Board Next.js App
After=docker.service
Requires=docker.service

[Service]
Restart=always
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up --build
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
EOL

  sudo systemctl daemon-reload
  sudo systemctl enable $APP_NAME
  sudo systemctl start $APP_NAME
fi

echo "=== ✅ Deployment completed! Visit http://<server-ip>:3000 ==="

🔑 Usage

Upload your project repo/zip to the server or update REPO_URL in the script.

Save the script:

nano deploy_jobboard.sh
chmod +x deploy_jobboard.sh
./deploy_jobboard.sh


Edit .env inside /opt/jobboard/.env with real secrets (DB, NEXTAUTH, S3, Resend).

Restart service after editing .env:

sudo systemctl restart jobboard
