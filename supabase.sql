-- ============================================================
-- Quicklink Production Schema  
-- Run this in your Supabase SQL Editor
-- Script is ADDITIVE — safe to run on existing database
-- ============================================================

-- ============================================================
-- 1. EXTEND qr_codes table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    short_id TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    title TEXT,
    scan_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add customization columns (safe if already exist)
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS fg_color TEXT DEFAULT '#000000';
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS style_type TEXT DEFAULT 'square'; -- square | dots | rounded

-- Add scheduling columns
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS active_from TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add password protection
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ============================================================
-- 2. SUBSCRIPTIONS table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free',   -- free | pro
    status TEXT NOT NULL DEFAULT 'active', -- active | inactive | pending
    instamojo_payment_id TEXT,
    instamojo_payment_request_id TEXT,
    amount_paid INTEGER DEFAULT 0,  -- in smallest currency unit (paise)
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. QR SCANS table (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,   -- desktop | mobile | tablet | unknown
    browser TEXT,
    os TEXT,
    is_bot BOOLEAN DEFAULT false,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast analytics queries
CREATE INDEX IF NOT EXISTS qr_scans_qr_code_id_idx ON public.qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS qr_scans_created_at_idx ON public.qr_scans(created_at);

-- ============================================================
-- 4. Enable RLS on all tables
-- ============================================================
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. RLS Policies for qr_codes
-- ============================================================
DROP POLICY IF EXISTS "Users can only see their own qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can insert their own qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update their own qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete their own qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Anyone can read active qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Public can read qr codes by short_id for redirect." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can manage their own qr codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Public can read any qr code for redirect" ON public.qr_codes;

CREATE POLICY "Users can manage their own qr codes"
    ON public.qr_codes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow public redirect lookups (needed for /qr/[shortId] route)
CREATE POLICY "Public can read any qr code for redirect"
    ON public.qr_codes FOR SELECT
    USING (true);

-- ============================================================
-- 6. RLS Policies for subscriptions
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 7. RLS Policies for qr_scans
-- ============================================================
DROP POLICY IF EXISTS "Users can view scans of their own qr codes" ON public.qr_scans;
DROP POLICY IF EXISTS "Allow scan log inserts" ON public.qr_scans;

CREATE POLICY "Users can view scans of their own qr codes"
    ON public.qr_scans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes
            WHERE qr_codes.id = qr_scans.qr_code_id
            AND qr_codes.user_id = auth.uid()
        )
    );

-- Allow server-side scan log inserts (service role or anon for logging)
CREATE POLICY "Allow scan log inserts"
    ON public.qr_scans FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- 8. Auto-create subscription row on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 9. Supabase Storage bucket for QR logos
-- ============================================================
-- Run this separately if you want logo uploads:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('qr-logos', 'qr-logos', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Users can upload their own logos"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'qr-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- ============================================================
-- 10. USER SETTINGS table (theme, display name, notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for user_settings (run once in Supabase dashboard):
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
