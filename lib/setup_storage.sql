-- Setup Supabase Storage for Product Images
-- Run this in your Supabase SQL Editor

-- Create storage bucket for product images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the 'products' bucket

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Policy 2: Allow public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy 3: Allow users to update their own product images
CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- Policy 4: Allow users to delete their own product images
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'products';
