-- Add support for multiple images per product (up to 10)
-- Run this in your Supabase SQL Editor

-- Step 1: Add image_urls column to store array of image URLs
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Migrate existing single image_url to array format
UPDATE products 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_image_urls ON products USING GIN (image_urls);

-- Step 4: Verify the changes
SELECT id, name, image_url, image_urls, array_length(image_urls, 1) as num_images 
FROM products 
ORDER BY created_at DESC
LIMIT 5;

-- Note: We keep image_url for backwards compatibility and as the primary/featured image
-- image_urls will contain ALL uploaded images (including the primary one)
