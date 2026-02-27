# 🎮 GameFolio: System Context & Product Specification

## 📌 Project Overview
GameFolio is a full-stack, web-based professional networking platform designed specifically for competitive gamers and esports organizations. It functions as a "LinkedIn for Gamers," bridging the gap between talent and recruiters. By replacing fragmented communication channels (Discord, Twitter DMs) with structured performance metrics and standardized application workflows, GameFolio professionalizes esports recruitment.

## 🎯 Core Objectives (MVP)
1. **Professional Portfolios:** Allow players to build verifiable profiles showcasing their ranks, roles, and game-specific statistics.
2. **Structured Recruitment:** Enable organizations to post detailed tryouts and manage applications in a centralized dashboard.
3. **Role-Based Security:** Ensure strict data isolation between Players, Recruiters, and Admins using Supabase Row Level Security (RLS).
4. **Fast & Responsive:** Deliver a mobile-first, high-performance web experience.

## 👥 User Roles & Permissions

### 1. Player (`PLAYER`)
* **Capabilities:** * Create and edit a personal gaming portfolio.
  * Input manual performance statistics (e.g., KDA, Win Rate, Main Game).
  * Browse active tryout postings.
  * Submit applications to tryouts.
  * Track the status of submitted applications.
* **Restrictions:** Cannot post tryouts or view other players' application statuses.

### 2. Recruiter / Organization (`RECRUITER`)
* **Capabilities:**
  * Create and manage an organization profile.
  * Post, edit, and close tryouts (Job Board).
  * Review applications submitted to their tryouts.
  * Update application statuses (`PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED`).
* **Restrictions:** Cannot apply to tryouts or modify other organizations' postings.

### 3. Administrator (`ADMIN`)
* **Capabilities:**
  * View all users, organizations, and tryouts.
  * Suspend/ban malicious users or organizations.
  * Delete inappropriate content (tryouts, profiles).

## 🔄 Core System Workflows

1. **Authentication Flow:** User signs up -> Supabase Auth triggers a database function -> Automatically creates a record in the `profiles` table with a default `PLAYER` role.
2. **The Application Flow:** Recruiter posts a `Tryout` -> Player views it and submits an `Application` -> Recruiter views the `Application` and updates its status -> Player sees the status update on their dashboard.

## 📦 Scope Boundaries (Strict MVP Limitations)
To ensure delivery by the feature freeze deadline (April 8th), the following features are **STRICTLY OUT OF SCOPE** for this version:
* ❌ Real-time game API integration (Riot API, Steam API, etc. - stats are manually inputted for now).
* ❌ In-app real-time messaging or chat functionality.
* ❌ Payment gateways or premium subscription tiers.
* ❌ Native iOS/Android mobile applications (the web app will be responsive instead).
* ❌ Complex notification systems (email alerts, SMS).

## 🛠 Technical Foundation
* **Frontend:** Next.js (App Router), React, Tailwind CSS.
* **Backend/Database:** Supabase (PostgreSQL, Auth, Storage).
* **Security:** Supabase Row Level Security (RLS) policies and Next.js Server-side route protection via `@supabase/ssr`.
* **Deployment:** Vercel.