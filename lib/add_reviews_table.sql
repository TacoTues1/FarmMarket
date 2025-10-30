-- Add reviews table for product ratings and comments
-- Run this in your Supabase SQL Editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- One review per user per product
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews table

-- Policy 1: Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
TO public
USING (true);

-- Policy 2: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::uuid = user_id);

-- Policy 3: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid()::uuid = user_id)
WITH CHECK (auth.uid()::uuid = user_id);

-- Policy 4: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid()::uuid = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS reviews_updated_at_trigger ON reviews;
CREATE TRIGGER reviews_updated_at_trigger
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Verify the table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
