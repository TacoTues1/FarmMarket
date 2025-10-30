-- Fix: Remove the CHECK constraint on profiles.role to allow 'user' role
-- Run this in your Supabase SQL Editor

-- Drop the existing CHECK constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Update any existing profiles to use 'user' role
UPDATE profiles SET role = 'user' WHERE role IN ('farmer', 'consumer');

-- Verify the changes
SELECT id, email, full_name, role FROM profiles;
