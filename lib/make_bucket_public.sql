-- Make the products storage bucket public
-- Run this in Supabase SQL Editor

-- Make bucket public (this fixes CORS issues)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'products';

-- Verify it worked
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'products';

-- If result shows public = true, you're done!
-- Your images should now load without CORS errors
