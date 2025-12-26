# Logical Architecture Diagram

Use the following structure to recreate the diagram in Draw.io.

## High-Level Layers
1.  **Client (Browser)**
    *   **Presentation (Views)**: Dashboard, Deals, Inventory, Analytics, Matrix.
    *   **Client Logic**: React Hooks (useMatrixLogic), State Management.
    *   **Service Layer**: API Connectors (Axios/Fetch).
2.  **Server (FastAPI)**
    *   **API Gateway/Routes**: /deals, /circuits, /mic-pom.
    *   **Controllers/Logic**: CRUD Operations, Aggregation.
3.  **Data Persistence**
    *   **Cache**: Redis (Hot Data).
    *   **Database**: PostgreSQL (Persistent Records).

## ASCII Representation (Terminal View)

```text
+---------------------------------------------------------------+
|                      CLIENT (Browser)                         |
|                                                               |
|  [ Dashboard ]  [  Deals  ]  [ Inventory ]  [ Analytics ]     |
|         |            |             |             |            |
|         v            v             v             v            |
|  +---------------------------------------------------------+  |
|  |                   Service Layer (API.ts)                |  |
|  +---------------------------------------------------------+  |
+------------------------------+--------------------------------+
                               | HTTPS / JSON
                               v
+------------------------------+--------------------------------+
|                      SERVER (FastAPI)                         |
|                                                               |
|  +---------------------------------------------------------+  |
|  |                       API Routes                        |  |
|  +---------------------------+-----------------------------+  |
|                              |                                |
|                              v                                |
|  +---------------------------+-----------------------------+  |
|  |   Business Logic (Models, Validation, Transformations)  |  |
|  +-------------+-----------------------------+-------------+  |
|                |                             |                |
+----------------|-----------------------------|----------------+
                 |                             |
      (Read/Write)|                  (Read/Write)|
                 v                             v
+----------------+--------+       +------------+-----------+
|      Redis Cache        |       |    PostgreSQL DB       |
| (Hot Data: Deals/Circ)  |       | (System of Record)     |
+-------------------------+       +------------------------+
```

## Mermaid Diagram

```mermaid
graph TD
    subgraph "Client Layer"
        UI[User Interface Components]
        Logic[Client Logic & Hooks]
        Service[API Service Layer]
        
        UI --> Logic
        Logic --> Service
    end

    subgraph "Backend Layer"
        API[FastAPI Routes]
        Controller[Business Logic]
        
        Service -- HTTPS/JSON --> API
        API --> Controller
    end

    subgraph "Data Layer"
        Redis[(Redis Cache)]
        DB[(PostgreSQL)]
        
        Controller -- Read/Write --> Redis
        Controller -- Read/Write --> DB
    end

    classDef layer fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef comp fill:#ffffff,stroke:#333,stroke-width:1px;
    
    class UI,Logic,Service,API,Controller comp;
    class Client Layer,Backend Layer,Data Layer layer;
```
