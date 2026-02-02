# Demo Deployment Instructions

I have prepared the demo deployment configuration and the dummy data seeding script.

**⚠️ Docker Desktop is not detected.**
To proceed, please ensure Docker Desktop is running.

## Steps to Run Demo

1.  **Start the Application**:
    Run the following command in your terminal:
    ```powershell
    docker-compose up -d --build
    ```

2.  **Wait for Initialization**:
    Wait about 30-60 seconds for the database and backend to start.

3.  **Seed Dummy Data**:
    Run the seeding script to populate the database:
    ```powershell
    docker-compose exec backend python seed_data.py
    ```

    This will create:
    *   2 Users (admin, jdoe)
    *   10 Deals with Notes
    *   20 Active Onboard Circuits
    *   5 Change Requests
    *   5 MIC POM Records
    *   10 Inventory Circuits
    *   1 Matrix Scan Session

4.  **Access the App**:
    *   Frontend: http://localhost
    *   Backend Docs: http://localhost:8000/docs
