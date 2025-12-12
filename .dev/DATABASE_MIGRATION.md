# Database Migration Guide for Elevated Wellness RX

This guide will help you set up your database schema in Supabase.

## Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy the SQL from `migrations/001_init_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

## Option 2: Using psql (Command Line)

If you have PostgreSQL installed locally:

```bash
psql "postgresql://postgres.nbhynvdxpzcahmkziynm:Jwjk683mwc7@aws-0-us-west-2.pooler.supabase.com:6543/postgres" < src/lib/migrations/001_init_schema.sql
```

## Option 3: Using a Node.js Script

```bash
npm install dotenv
node src/lib/migrations/migrate.js
```

## Tables Created

Your migration will create the following tables:

1. **contact_messages** - Stores contact form submissions
   - Tracks user inquiries with reason, message, and consent

2. **waitlist_entries** - Manages waitlist signups
   - Includes status tracking (active, contacted, enrolled)

3. **refill_requests** - Handles prescription refill requests
   - Stores patient info, medications, and service preferences

4. **transfer_requests** - Manages prescription transfers
   - Captures destination pharmacy details

5. **splash_modal_submissions** - Tracks email signup prompts
   - Stores email addresses from marketing modals

## Enum Types

The following PostgreSQL enum types are created:
- `contact_reason`: general, new, transfer, refill, rpm
- `waitlist_status`: active, contacted, enrolled
- `service_preference`: pickup, delivery

## Security

All tables have Row Level Security (RLS) enabled with open policies for INSERT and SELECT. You should customize these policies based on your security requirements.

## Verification

After running the migration, verify your tables in Supabase:

1. Go to **Table Editor** in the left sidebar
2. You should see all new tables listed
3. Click on each table to verify the structure
