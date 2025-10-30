# Supabase Storage Setup for Product Images

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Enter these details:
   - **Name**: `products`
   - **Public bucket**: ✅ Check this box (to allow public access to images)
6. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up policies:

### Option A: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the contents of `lib/setup_storage.sql`
3. Click **"Run"**

### Option B: Manual Policy Creation

1. Go to **Storage** → Click on the `products` bucket
2. Click on **"Policies"** tab
3. Add these policies:

**Policy 1: Upload Images**
- Name: `Authenticated users can upload product images`
- Allowed operation: INSERT
- Target roles: authenticated
- USING expression: `bucket_id = 'products'`

**Policy 2: View Images**
- Name: `Public can view product images`
- Allowed operation: SELECT
- Target roles: public
- USING expression: `bucket_id = 'products'`

**Policy 3: Update Images**
- Name: `Users can update their own product images`
- Allowed operation: UPDATE
- Target roles: authenticated
- USING expression: `bucket_id = 'products'`

**Policy 4: Delete Images**
- Name: `Users can delete their own product images`
- Allowed operation: DELETE
- Target roles: authenticated
- USING expression: `bucket_id = 'products'`

## Step 3: Test the Upload

1. Start your development server: `npm run dev`
2. Log in to your application
3. Go to **My Products** → **Add New Product**
4. Try uploading an image from your computer
5. The image should upload successfully and display a preview

## Features

✅ **Drag & Drop Support**: Users can drag and drop images
✅ **Image Preview**: Shows preview before uploading
✅ **File Validation**: 
   - Only image files accepted (PNG, JPG, GIF, etc.)
   - Max file size: 5MB
✅ **Fallback URL**: Users can still enter image URLs if preferred
✅ **Public Access**: Images are publicly accessible via CDN

## Storage Structure

Images are stored with this naming convention:
```
products/
  └── product-images/
      └── {userId}-{timestamp}.{extension}
```

Example: `products/product-images/123e4567-e89b-12d3-a456-426614174000-1698765432000.jpg`

## Troubleshooting

**Error: "Failed to upload image"**
- Make sure the storage bucket is created
- Verify policies are set up correctly
- Check that the bucket is public

**Images not displaying**
- Verify the bucket is marked as "public"
- Check browser console for CORS errors
- Ensure the file was uploaded successfully in Storage dashboard
