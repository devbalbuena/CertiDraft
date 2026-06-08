# CertiDraft

CertiDraft is a modern, high-performance web application designed for creating, managing, and batch-generating custom certificates. Built with Next.js 16 (App Router), Supabase, and Fabric.js, it offers a seamless experience from user authentication to advanced drag-and-drop certificate design.

## 🚀 Progress Summary (What's Built So Far)

The system has been built out in several structured phases. Here is a breakdown of the currently implemented features and architecture:

### 1. Core Architecture & Tech Stack
- **Framework:** Next.js 16 (App Router) with Turbopack for lightning-fast development.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS with a comprehensive suite of accessible UI components from **Shadcn UI** (Buttons, Cards, Dialogs, Dropdowns, Tabs, Sliders, etc.).
- **Database & Auth:** Supabase (PostgreSQL) with Server-Side Rendering (SSR) client integration.
- **State Management:** Zustand for lightweight, cross-component state (specifically used in the Certificate Builder).
- **Canvas Rendering:** Fabric.js v7 for robust, interactive 2D canvas manipulation.

### 2. Authentication & Authorization
- **Supabase Auth Integration:** Full user authentication flow using Supabase SSR packages.
- **Role-Based Access Control (RBAC):** Users are assigned roles (e.g., `admin`, `user`).
- **Route Guards:** Implementation of robust route protection mechanisms (`AdminRouteGuard`) to ensure administrative pages are only accessible to authorized users.

### 3. User Dashboard
- **Dashboard Home:** Displays real-time statistics for the user, including total certificates generated, monthly limits, current subscription plan, and recent batch generation jobs.
- **Project Management:** Complete CRUD capabilities for certificate projects. Users can create new campaigns, view project details, and delete projects.
- **Project Workflows:** A tabbed interface for managing a project's lifecycle: Overview, Upload Data, Design Template, and Generate.
- **Navigation:** Responsive Sidebar and Topbar with user profile management and breadcrumb navigation (intelligently handling UUIDs).

### 4. Admin Panel
- **Admin Layout:** A dedicated layout and sidebar specifically for system administrators.
- **Management Views:** Interfaces set up for overseeing system Analytics, User Management, Global Templates, Billing, and Global Settings.

### 5. Advanced Certificate Builder (Fabric.js)
The core feature of CertiDraft is the custom drag-and-drop certificate designer, which allows users to visually build their certificate templates.
- **Client-Side Rendering:** The builder is dynamically imported (`ssr: false`) to ensure compatibility with Fabric.js, which requires the browser DOM.
- **Interactive Canvas (`CertificateCanvas`):** Supports zooming, panning (Space + Drag), object selection, and inline text editing. Built-in safeguards protect against React Strict Mode rendering issues.
- **Toolbar (`BuilderToolbar`):** Allows users to add editable Text, Rectangles, Circles, Images, and placeholder QR Codes. Includes Undo/Redo history tracking, zoom controls, and design saving/previewing.
- **Properties Panel (`BuilderPropertiesPanel`):** Context-aware right panel that updates based on the selected element. Users can change text content, fonts, colors, alignment, styles (bold/italic), and shape properties (stroke, fill, opacity, corner radius).
- **Layers Panel (`BuilderLayersPanel`):** Left panel providing a Photoshop-style view of all canvas elements, allowing users to reorder (move up/down), select, and delete objects.
- **Variable Integration:** Users can insert template variables (e.g., `{{recipient_name}}`, `{{issued_date}}`) which will be replaced with real data during the batch generation phase.
- **Auto-Save & Persistence:** Designs are serialized to JSON and securely saved to the Supabase `projects` table via dedicated API routes (`PATCH /api/projects/[id]/design`).

### 6. API & Database Integrity
- **API Routes:** Secure Next.js API route handlers validating user sessions and ownership before allowing data mutations (e.g., deleting a project or saving a design).
- **RLS Policies:** Row Level Security implemented in Supabase to ensure users can only access and modify their own data.

## 🔜 Next Steps

The upcoming phases will focus on the final steps of the certificate lifecycle:
1. **Data Upload & Mapping (Phase 7):** Allowing users to upload CSV files of recipients and map columns to the design variables.
2. **Batch Generation Engine:** Processing the template and the data to generate hundreds of personalized PDF/Image certificates in the background.
3. **Delivery & Export:** Allowing users to download the generated batches or potentially email them directly to recipients.
