-- Alternative: Simple reviews table setup
-- Run this in your Supabase SQL Editor if the main script fails

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- Drop table if exists
DROP TABLE IF EXISTS reviews CASCADE;

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_product_review UNIQUE(product_id, user_id)
);

-- Create indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read reviews (no auth required)
CREATE POLICY "reviews_select_policy"
ON reviews FOR SELECT
USING (true);

-- Policy 2: Authenticated users can insert their own reviews
CREATE POLICY "reviews_insert_policy"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::uuid = user_id);

-- Policy 3: Users can update their own reviews
CREATE POLICY "reviews_update_policy"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid()::uuid = user_id);

-- Policy 4: Users can delete their own reviews
CREATE POLICY "reviews_delete_policy"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid()::uuid = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER reviews_updated_at_trigger
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reviews_updated_at();

-- Test: Verify table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
