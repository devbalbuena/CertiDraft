# CertiDraft

## Overview
CertiDraft is a comprehensive, full-stack certificate generation platform designed to streamline the creation, issuance, and verification of professional credentials. Built for educators, event organizers, and institutions, it solves the tedious problem of manual certificate creation by offering a powerful drag-and-drop designer, bulk CSV data mapping, AI-generated citations, and automated email delivery. Every certificate issued is cryptographically verifiable via a unique public URL.

## Live Demo
[Live Demo](Not yet deployed)

## Screenshots
![Main Page](./screenshots/main.png)
![Dashboard](./screenshots/dashboard.png)
*(Add your screenshots to a `/screenshots` folder in the root)*

## Features

**Authentication & Profiles**
- Email & password sign up / login via Supabase Auth
- Secure password recovery flow
- Profile management (Full Name, Avatar URL)

**Project Management**
- Create and organize isolated certificate projects
- Track generated certificate counts and project statuses
- Global templates gallery for quick starts

**Certificate Designer**
- Advanced drag-and-drop canvas powered by Fabric.js
- Support for Text, Shapes (Rectangles, Circles), Images, and QR Codes
- Dynamic variable injection (e.g., `{{recipient_name}}`, `{{achievement}}`)
- Comprehensive properties panel (fonts, colors, alignment, corner radius, opacity)
- Layer ordering (Bring to Front, Send to Back) and Canvas background color controls
- Zoom, pan, undo, redo, and preview capabilities

**Data Upload & Mapping**
- 4-step interactive CSV upload wizard (using PapaParse)
- Intelligent column mapping from CSV to certificate variables
- Data preview table before initiating generation

**AI Citation Generation**
- Integration with Google's Gemini 2.0 Flash (`@google/generative-ai`)
- Automatically generates personalized 2-3 sentence professional citations based on recipient name, achievement, and tone

**Batch Processing Worker**
- Robust background worker using BullMQ and Redis
- Headless Puppeteer rendering of Fabric.js canvas to pixel-perfect PDFs
- Automatic upload of generated PDFs to Supabase Storage
- Real-time job status tracking

**Verification & Wallets**
- Unique public verification page for every issued certificate (`/verify/[token]`)
- Public user wallets showcasing all certificates earned by an email (`/wallet/[slug]`)
- Privacy toggles for public/private wallets
- 1-click social sharing to LinkedIn

**Email Delivery**
- Automated certificate dispatch via Resend
- Custom branded HTML email templates
- Direct download and verification links included in emails

**Billing & Subscriptions**
- Four-tier system: Free, Starter, Pro, and Enterprise
- Monthly usage tracking and hard limits
- Feature gating (e.g., AI Citations and Email Delivery restricted to paid plans)

**Admin & Security**
- Role-based access control (RBAC) Admin panel
- Row Level Security (RLS) policies enforced via Supabase

## Tech Stack

| Category       | Technology |
|----------------|------------|
| Frontend       | Next.js (App Router), React, Tailwind CSS, Shadcn UI, Fabric.js, Zustand |
| Backend        | Next.js Route Handlers, Node.js (Worker), BullMQ, Puppeteer |
| Database       | Supabase (PostgreSQL), Redis (Upstash) |
| Authentication | Supabase Auth |
| Styling        | Tailwind CSS (v4), Lucide React |
| Deployment     | Vercel (Frontend), Railway (Worker) |
| Build Tool     | npm, TypeScript |

## Project Structure

```text
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # Backend API endpoints (projects, batch, users, ai)
│   ├── auth/             # Login, signup, reset password pages
│   ├── dashboard/        # Main user dashboard, project management, settings, subscription
│   ├── verify/           # Public certificate verification pages
│   └── wallet/           # Public user certificate showcase wallets
├── components/           # Reusable React components
│   ├── certificates/     # Certificate designer, properties panel, toolbar, layers
│   ├── layout/           # Sidebar, topbar, page headers
│   ├── ui/               # Shadcn UI primitives
│   └── uploads/          # CSV upload, mapping, and generation wizard
├── context/              # React Context providers (AuthContext)
└── lib/                  # Utilities, Supabase clients, queue config, subscriptions
workers/                  # Node.js background worker processes
```

## Database Schema

- **`users`**
  - Columns: `id`, `email`, `full_name`, `avatar_url`, `plan`, `certificates_this_month`, `role`, `wallet_slug`, `wallet_title`, `wallet_is_public`
  - Purpose: Stores user profiles, active subscription limits, and public wallet configuration.
- **`projects`**
  - Columns: `id`, `user_id`, `name`, `description`, `event_type`, `elements`, `certificate_count`, `status`, `template_id`
  - Purpose: Represents a campaign. Links to the user and stores the JSON definition of the certificate design.
- **`batch_jobs`**
  - Columns: `id`, `project_id`, `status`, `total_count`, `processed_count`, `csv_data`, `mapping`
  - Purpose: Tracks the status and progress of bulk generation jobs triggered by CSV uploads.
- **`certificates`**
  - Columns: `id`, `user_id`, `project_id`, `recipient_name`, `recipient_email`, `achievement`, `grade`, `issued_date`, `verification_token`, `storage_path`, `storage_bucket`, `last_email_sent_at`
  - Purpose: Stores individual issued certificates, verification tokens, and Supabase Storage paths.
- **`templates`**
  - Columns: `id`, `name`, `description`, `elements`, `thumbnail_url`
  - Purpose: Global predefined templates that users can clone into their own projects.

## Local Setup Instructions

### Prerequisites
- Node.js 20+
- npm
- Supabase account (for PostgreSQL, Auth, and Storage)
- Redis instance (e.g., Upstash)
- Resend API Key
- Google Gemini API Key

### Installation Steps
1. Clone the repository and navigate into it.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env.local` file (see below).
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open a second terminal and start the background worker:
   ```bash
   npm run worker:certificates
   ```

### Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Your Supabase public anon key
SUPABASE_SERVICE_ROLE_KEY=Your Supabase service role key (for admin actions)
REDIS_URL=Your Redis connection string (must start with rediss://)
RESEND_API_KEY=Your Resend API key for sending emails
GEMINI_API_KEY=Your Google Gemini API key for generating AI citations
NEXT_PUBLIC_SITE_URL=The base URL of the site (e.g., http://localhost:3000)
SUPABASE_CERTIFICATES_BUCKET=Name of the public storage bucket (e.g., certificates)
```

## Deployment

CertiDraft consists of two main components that must be deployed separately:

1. **Frontend (Vercel)**
   - Connect your repository to Vercel.
   - The `vercel.json` file automatically configures the correct max durations.
   - The `next.config.ts` prevents heavy Node.js dependencies (Puppeteer) from bundling into Vercel's edge network.
   - Add all environment variables to the Vercel project settings. Ensure `NEXT_PUBLIC_SITE_URL` matches your new production URL.

2. **Background Worker (Railway / Render)**
   - Connect the same repository to a persistent host like Railway.
   - The included `railway.json` and `Procfile` define the build and start commands (`npm run worker:certificates`).
   - Add the exact same environment variables to the Railway project.

## Author
Ivan Lee Balbuena  
3rd Year IT Student — Caraga State University  
Open to freelance: Full-Stack · UI/UX · AI Projects

## License
MIT License
