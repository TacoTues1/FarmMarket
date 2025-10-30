-- Fix CORS issues for Supabase Storage
-- This ensures images can be displayed in your app

-- Make sure the 'products' bucket is PUBLIC
UPDATE storage.buckets 
SET public = true 
WHERE id = 'products';

-- Verify the bucket is public
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'products';

-- Note: You also need to configure CORS in Supabase Dashboard
-- Go to: Storage → Configuration → CORS
-- Add allowed origins: http://localhost:3000, https://*.vercel.app
