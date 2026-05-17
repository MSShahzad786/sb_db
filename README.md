# Supabase Admin Dashboard

A complete, responsive admin dashboard web application for Supabase, built with React, Vite, Tailwind CSS, and shadcn/ui.

## Features

- **Authentication**: Secure login using Supabase Auth.
- **Dashboard**: Overview of your database activity and status.
- **Database Explorer**: View, search, and delete records dynamically across public tables.
- **Table Manager**: Create new tables dynamically via the UI.
- **SQL Editor**: Execute raw SQL queries directly from the dashboard.
- **Bulk Import**: Upload JSON or CSV files to insert records in bulk.
- **MCQ Upload Tool**: Specialized tool for uploading multiple-choice questions.

## Requirements

1. Node.js 18+
2. A Supabase Project

## Setup Instructions

1. **Clone the repository** (if not already local).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Supabase URL and Anon Key.
   ```bash
   cp .env.example .env.local
   ```
4. **Supabase Database Setup**:
   To enable advanced features like fetching tables and running raw SQL via the `anon` key, you must create the following RPC functions in your Supabase SQL Editor:

   *Function 1: get_tables()*
   ```sql
   CREATE OR REPLACE FUNCTION get_tables() 
   RETURNS text[] AS $$
     SELECT array_agg(table_name::text) 
     FROM information_schema.tables 
     WHERE table_schema = 'public';
   $$ LANGUAGE sql SECURITY DEFINER;
   ```

   *Function 2: exec_sql() (Warning: Admin Use Only)*
   ```sql
   CREATE OR REPLACE FUNCTION exec_sql(query text) 
   RETURNS jsonb AS $$
   DECLARE
     result jsonb;
   BEGIN
     EXECUTE 'SELECT jsonb_agg(t) FROM (' || query || ') t' INTO result;
     RETURN result;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Tech Stack
- React + Vite
- Tailwind CSS
- Supabase JS SDK
- React Router
- Zustand
- shadcn/ui & Radix UI Primitives
- Lucide React (Icons)
- PapaParse (CSV parsing)

## Deployment
Ready to be deployed on Vercel. Connect your repository, add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel's environment variables, and deploy!
