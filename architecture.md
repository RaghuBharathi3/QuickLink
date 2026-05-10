# Simplified Architecture Diagram

Here is a simplified, high-level architecture diagram perfect for including in a project report.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef frontend fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef backend fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    %% Nodes
    User([User / Web Browser]):::client
    
    subgraph Quicklink_Platform [Quicklink Platform]
        UI[Frontend <br/> React & Next.js]:::frontend
        API[Backend API <br/> Next.js App Router]:::frontend
    end

    DB[(Supabase <br/> PostgreSQL & Auth)]:::backend
    Payments[Razorpay <br/> Payment Gateway]:::external

    %% Connections
    User -->|Interacts with UI| UI
    User -->|Scans QR Code| API
    
    UI <-->|API Requests / Responses| API
    
    API <-->|Reads / Writes Data| DB
    API <-->|Processes Payments| Payments
```
