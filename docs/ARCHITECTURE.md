# EduFlow System Architecture

## Overview
EduFlow is designed as a modern, scalable Learning Management System (LMS) leveraging serverless technologies to ensure high availability, performance, and unlimited scalability.

## Scalability & Performance Strategy

### 1. Compute & High Availability
- **Next.js (Serverless):** The application logic runs on serverless functions (Vercel/AWS Lambda).
  - **Auto-Scaling:** Automatically scales from 0 to thousands of concurrent requests based on traffic.
  - **High Availability:** Distributed across multiple availability zones globally.
  - **Zero Maintenance:** No servers to manage or patch.

### 2. Database (Data Scalability)
- **Supabase (PostgreSQL):** 
  - **Connection Pooling:** Uses PgBouncer internally to handle thousands of concurrent connections.
  - **Read Replicas:** Architecture supports adding read replicas for high-traffic read operations (e.g., browsing courses).
  - **Indexing:** Optimized indexes on `contents(category, tags)` and `enrollments` for fast queries (< 100ms).

### 3. Storage (Unlimited Media)
- **Supabase Storage (S3-backed):**
  - **Unlimited Storage:** Metadata pointers are stored in Postgres, while actual files reside in S3-compatible object storage, effectively allowing infinite storage capacity.
  - **CDN Integration:** All media files (videos, images) are served via a Global CDN (Content Delivery Network).
  - **Cache Control:** Strategic caching (`max-age=31536000`) ensures static content (lesson videos) is cached at the edge, minimizing latency and origin server load.

### 4. Video Playback
- **Optimization:**
  - **Lazy Loading:** Video players use `preload="metadata"` to conserve bandwidth.
  - **HLS/Dash Ready:** The architecture allows integration with transcoding services (like Mux/AWS MediaConvert) for adaptive bitrate streaming in the future.

### 5. Frontend Performance
- **Server Components:** Heavy data fetching happens on the server, reducing client-side bundle size.
- **Image Optimization:** Next.js Image component automatically resizes and converts images to WebP/AVIF.
- **Pagination:** Course lists are paginated (12 items/page) to ensure constant load times regardless of data volume.

## Security & Reliability
- **Row Level Security (RLS):** Data access is secured at the database via Postgres RLS policies, ensuring robust multi-tenant security.
- **Backup:** Automated daily backups with Point-in-Time Recovery (PITR).

This architecture ensures EduFlow can grow from a pilot project to serving millions of learners without architectural rewrites.
