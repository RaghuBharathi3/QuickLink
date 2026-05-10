# Simplified Architecture Diagram

Here is a simplified, high-level architecture diagram perfect for including in a project report.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000000,font-weight:bold,font-size:16px;
    classDef frontend fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000000,font-weight:bold,font-size:16px;
    classDef backend fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000000,font-weight:bold,font-size:16px;
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000,font-weight:bold,font-size:16px;
    classDef edgeLabel font-weight:bold,color:#000000,font-size:14px;

    %% Nodes
    User([<b>User / Web Browser</b>]):::client
    
    subgraph Quicklink_Platform [<b>Quicklink Platform</b>]
        UI[<b>Frontend</b> <br/> React & Next.js]:::frontend
        API[<b>Backend API</b> <br/> Next.js App Router]:::frontend
    end

    DB[(<b>Supabase</b> <br/> PostgreSQL & Auth)]:::backend
    Payments[<b>Razorpay</b> <br/> Payment Gateway]:::external

    %% Connections
    User -->|<b>Interacts with UI</b>| UI
    User -->|<b>Scans QR Code</b>| API
    
    UI <-->|<b>API Requests / Responses</b>| API
    
    API <-->|<b>Reads / Writes Data</b>| DB
    API <-->|<b>Processes Payments</b>| Payments
```
