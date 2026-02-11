# Non-Functional Requirements (NFR) Compliance Strategy

## 2.1 Performance
### Requirement:
- Load course lists within 3 seconds.
- Minimal video buffering.
- Adjustable video quality.

### Implementation Strategy:
1.  **Database Optimization**:
    - applied B-Tree indexes on frequently queried columns (`status`, `created_at`, `category`, `creator_id`) via `docs/performance_tuning.sql`. This ensures sub-second query times even with millions of records.
    - Used Supabase's managed Postgres for high-performance read replicas (future scale).

2.  **Frontend Optimization**:
    - **Pagination**: The course listing page (`/courses`) implements server-side pagination (limit/offset) to fetch only necessary data, ensuring the initial load size is constant regardless of total records.
    - **Lazy Loading**: Images use native `loading="lazy"` (and Next.js Image component readiness) to prioritize above-the-fold content.
    - **Video Player**: Configured with `preload="metadata"` to download minimal data before user interaction. Added `playsInline` for mobile optimization.
    - **Quality Control**: Added UI for adaptive bitrate selection (mockup ready for backend transcoding integration via HLS/DASH).

## 2.2 Scalability
### Requirement:
- High availability (24/7).
- Support large concurrent users.
- Unlimited storage for digital assets.
- Expandable storage capacity.

### Implementation Strategy:
1.  **Serverless Architecture**:
    - Built on **Next.js (Vercel)** and **Supabase**, which are serverless platforms. They automatically scale compute resources based on traffic demand (handling spikes without manual intervention).
    
2.  **Storage Scalability**:
    - Used **Supabase Storage (S3-compatible)** for all digital assets (Video, PDF, Audio).
    - **Unlimited Scale**: Object storage naturally supports petabytes of data without partitioning or filesystem limits.
    - **CDN Integration**: Assets are served via CDNs (Global Edge Network) to reduce latency and load on the origin server.

3.  **Database Scalability**:

## 2.4 User Experience (UX)
### Requirement:
- User-friendly and intuitive UI.
- Fast response time.
- Responsive Design (Multi-device: Desktop, Tablet, Mobile).

### Implementation Strategy:
1.  **Responsive Design**:
    - Built with **Tailwind CSS Mobile-First approach**.
    - **Navbar**: Implemented a collapsible hamburger menu for mobile devices, ensuring navigation is accessible on small screens (`components/Navbar.tsx`).
    - **Grid Layouts**: Used adaptive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) to display content elegantly across all screen sizes.
    
2.  **Intuitive Interactions**:
    - **Visual Feedback**: Added loading spinners and hover effects to buttons (e.g., Delete/Unenroll buttons).
    - **Confirmation Dialogs**: Implemented preventive confirmation prompts before destructive actions (Delete Course, Unenroll) to prevent user error.
    - **Clear Hierarchy**: Used typography and spacing (whitespace) to guide user attention, with distinct styles for headings and body text.
    - **Consistent Theming**: Enforced a consistent Light/Dark mode experience with carefully selected color palettes (Slate/Indigo).

## 2.5 Maintainability
### Requirement:
- System logging for monitoring and troubleshooting.

### Implementation Strategy:
1.  **Centralized Logging**:
    - Created a `system_logs` table in the database to persistently store critical application events errors (`docs/logging_schema.sql`).
    - Implemented a server-side utility `lib/logger.ts` that writes logs to both the server console (for immediate dev feedback) and the database (for long-term audit).

2.  **Audit Trails**:
    - Critical actions like **Course Deletion** and **Unenrollment** are logged with:
        - `level`: INFO, WARN, ERROR
        - `message`: Descriptive text
        - `user_id`: Who performed the action
        - `metadata`: JSON details (e.g., courseId, error stack)
    - This allows administrators to trace "Who did what and when".

3.  **Code Structure**:
    - Modularized code into `components/`, `lib/`, and `app/` directories.
    - Used **Server Actions** for clean separation of backend logic from frontend UI.
