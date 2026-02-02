# MIC Platform Deployment Guide

This guide provides step-by-step instructions to deploy the MIC Platform, a comprehensive circuit and deal management system. The application consists of a **React Frontend**, **Python FastAPI Backend**, **PostgreSQL Database**, and **Redis Cache**.

---

## 🏗️ Architecture Overview

*   **Frontend**: React (Vite) + Nginx (Reverse Proxy)
*   **Backend**: Python FastAPI
*   **Database**: PostgreSQL 15
*   **Cache**: Redis
*   **AI**: OpenAI GPT-4o Integration

---

## 🚀 Option 1: Quick Start (Local Docker Deployment)

Run the entire stack locally using Docker Compose.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
*   Git (to clone the repository).

### 1. Configuration
Ensure your environment variables are set.
*   **Backend Secrets**: Edit `python-backend/.env`
    ```properties
    # Database Config (Default for Docker)
    DB_HOST=db
    DB_NAME=mic_platform
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_SSL_MODE=disable

    # External Services
    OPENAI_API_KEY=your_sk_project_api_key_here
    REDIS_HOST=redis
    ```

### 2. Build and Run
Open your terminal in the project root (`application-database`) and run:

```bash
docker-compose up -d --build
```

*   `--build`: Forces a rebuild of images (useful after code changes).
*   `-d`: Detached mode (runs in background).

### 3. Access the Application
*   **Frontend**: Open [http://localhost](http://localhost)
*   **Backend API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
*   **Database**: Port `5432` (User/Pass: `postgres`/`postgres`)

### 4. Stop the Application
To shut down all services:
```bash
docker-compose down
```

---

## ☁️ Option 2: Cloud Deployment (Production)

This guide assumes a deployment on **Microsoft Azure**, but the principles apply to AWS/GCP (ECS, RDS, ElastiCache).

### 1. Database & Cache (Managed Services)
Instead of running DB/Redis in containers, use managed cloud services for reliability.
*   **PostgreSQL**: Create an *Azure Database for PostgreSQL - Flexible Server*.
    *   Allow access from your app's VNET or IP.
    *   Run the contents of `init.sql` to initialize schema.
*   **Redis**: Create an *Azure Cache for Redis*.

### 2. Backend (Container App / App Service)
1.  **Build Image**:
    ```bash
    cd python-backend
    docker build -t yourregistry.azurecr.io/mic-backend:latest .
    docker push yourregistry.azurecr.io/mic-backend:latest
    ```
2.  **Deploy**:
    *   Create an Azure Container App or Web App for Containers.
    *   Set **Environment Variables** in the cloud portal (Override the local defaults):
        *   `DB_HOST`: <your-azure-postgres-host>
        *   `DB_USER`: <your-admin-user>
        *   `DB_PASSWORD`: <your-password>
        *   `DB_SSL_MODE`: require
        *   `REDIS_HOST`: <your-redis-host>
        *   `REDIS_PASSWORD`: <your-redis-key>
        *   `OPENAI_API_KEY`: <your-openai-key>

### 3. Frontend (Static Web App / CDN)
Since the frontend is a static React site (served by Nginx in Docker), you have two choices:

**Choice A: Docker (Same as Backend)**
1.  **Build Image**:
    ```bash
    # Root directory
    docker build -t yourregistry.azurecr.io/mic-frontend:latest .
    docker push yourregistry.azurecr.io/mic-frontend:latest
    ```
2.  **Deploy**: Deploy as a Container App.
3.  **Config**: Ensure the Nginx proxy in `nginx.conf` points to your *Production Backend URL*, NOT `http://backend:8000`. You might need to update `nginx.conf` or use a custom startup script to inject the backend URL.

**Choice B: Static Hosting (Recommended)**
1.  **Build**:
    ```bash
    npm install
    npm run build
    ```
2.  **Deploy**: Upload the `dist/` folder to **Azure Static Web Apps** or **Netlify/Vercel**.
3.  **Config**: Update `API_BASE_URL` in `services/api.ts` (or use `.env.production`) to point to your deployed Backend URL (e.g., `https://mic-backend.azurewebsites.net`).

---

## 🛠️ Troubleshooting

**Issue**: Database connection failed.
*   **Local**: Check if `docker-compose` started the `db` container (`docker ps`). Verify `init.sql` ran successfully (logs: `docker logs application-database-db-1`).
*   **Cloud**: Check Firewall rules on Azure PostgreSQL. Ensure `DB_SSL_MODE` is set to `require`.

**Issue**: Nginx 502 Bad Gateway.
*   **Local**: The backend container might be crashing. Check logs: `docker logs application-database-backend-1`.
*   **Frontend**: Ensure the Nginx `proxy_pass` is pointing to the correct backend host/port.

**Issue**: AI Features not working.
*   **Check Key**: Ensure `OPENAI_API_KEY` is set correctly in `python-backend/.env` or Docker environment variables.
*   **Check Model**: Ensure your API key has access to `gpt-4o`.
