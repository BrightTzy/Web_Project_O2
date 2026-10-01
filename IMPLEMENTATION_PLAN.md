# Complete Implementation Plan
**Warehouse & Logistics Management System**

This document serves as the master blueprint for developing the entire web application from start to finish.

## 0. Architecture & Tech Stack
*   **Repository Structure:** Monorepo style with a completely decoupled Frontend and Backend.
*   **Frontend Framework:** Pure Vanilla React (initialized with Vite).
*   **Backend Framework:** Next.js (Used strictly as a REST API Server).
*   **Database:** MongoDB (Self-hosted via Docker).
*   **Styling:** Pure Vanilla CSS (Focus on premium, sleek dark color aesthetics and glassmorphism).
*   **Data Fetching:** `@tanstack/react-query` for cached, real-time updates on the frontend.
*   **Authentication:** JWT (JSON Web Tokens) with `bcrypt` password hashing on the backend.
*   **Deployment Target:** Vercel (Frontend & Backend) & Cloud Server (MongoDB).

---

## Phase 1: Environment Setup (Split Architecture)
1.  **Backend Initialization (`/backend`):** Run `create-next-app` to set up the Next.js API server. Strip all UI code since it will only serve JSON endpoints.
2.  **Frontend Initialization (`/frontend`):** Run `npm create vite@latest` to scaffold a pure React Single Page Application (SPA).
3.  **Dockerization:** Create `docker-compose.yml` in the root to effortlessly run the Frontend, Backend, and MongoDB locally.
4.  **Backend Dependencies:** Install `mongoose`, `bcrypt`, `jsonwebtoken` in `/backend`.
5.  **Frontend Dependencies:** Install `react-router-dom`, `lucide-react`, and `@tanstack/react-query` in `/frontend`.
6.  **Environment Variables:** Setup `.env.local` for the backend with `MONGODB_URI` and `JWT_SECRET`. Configure Vite's proxy in the frontend to seamlessly talk to the Next.js backend.

## Phase 2: Database & Models (Backend)
1.  **Connection Utility:** Write `src/lib/dbConnect.js` in the Next.js backend.
2.  **Define Schemas (`src/models/index.js`):**
    *   `User`: (username, password, role).
    *   `Product`: Master catalog of items.
    *   `Warehouse`: Physical locations.
    *   `Inventory`: Tracks Product stock at specific Warehouses.
    *   `Customer`: Recipient profiles.
    *   `Shipment`: Tracks outbound logistics.
    *   `AuditLog`: Tracks critical system changes.

## Phase 3: Backend API Development (Next.js)
1.  **Authentication API:**
    *   `POST /api/auth/register` & `POST /api/auth/login`.
2.  **Entity CRUD APIs:**
    *   `GET/POST /api/products` & `DELETE /api/products/[id]`
    *   `GET/POST /api/warehouses` & `DELETE /api/warehouses/[id]`
    *   `GET/POST /api/shipments` & `PATCH /api/shipments/[id]`
3.  **Analytics API:**
    *   `GET /api/stats`: Aggregates counts for the dashboard.

## Phase 4: Frontend UI Foundation (Vite React)
1.  **Routing Setup:** Configure `react-router-dom` in the frontend for robust client-side routing.
2.  **Design System (`src/globals.css`):** Implement a premium dark color theme, typography (Inter), and reusable CSS classes.
3.  **React Query Provider:** Wrap the React app in `main.jsx` with `@tanstack/react-query`.
4.  **Auth Pages:** Build the Login screen to communicate with the backend API.
5.  **Dashboard Layout:** Create the persistent Sidebar navigation wrapping all internal routes.

## Phase 5: Building the Dashboards (Frontend)
1.  **Executive Overview:** Real-time metric cards and the primary `Product` CRUD table.
2.  **Warehouse Management:** UI to manage physical locations.
3.  **Shipment Tracking:** UI for outbound shipments and lifecycle status.

## Phase 6: Polish & Security
1.  **Frontend Route Protection:** Implement higher-order components (Private Routes) to redirect unauthenticated users back to login.
2.  **Secure Tokens:** Refactor token storage from `localStorage` to HttpOnly Cookies via the Next.js backend.
3.  **Error Handling:** Ensure all API routes and frontend queries gracefully handle errors.
