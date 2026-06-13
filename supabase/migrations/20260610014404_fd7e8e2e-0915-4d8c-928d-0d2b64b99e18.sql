ALTER TABLE public.admin_creatives
  ADD COLUMN IF NOT EXISTS master_message text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;