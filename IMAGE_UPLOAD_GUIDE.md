# 🖼️ Product Image Upload - Quick Start Guide

## ✅ What I've Added

I've implemented a complete image upload system for your products! Here's what's new:

### Features Added:
1. **Upload from Computer** - Users can now upload images directly from their device
2. **Drag & Drop Support** - Drag images onto the upload area
3. **Live Preview** - See the image before saving
4. **File Validation** - Only images up to 5MB accepted
5. **Edit Product Images** - Can change images when editing products
6. **Fallback URL Option** - Still supports image URLs as an alternative

### Files Modified/Created:
- ✅ `app/farmer/products/new/page.js` - Added image upload to new product form
- ✅ `app/farmer/products/[id]/edit/page.js` - NEW: Edit product page with image upload
- ✅ `lib/setup_storage.sql` - SQL script to set up Supabase Storage
- ✅ `STORAGE_SETUP.md` - Complete setup instructions

---

## 🚀 Setup Steps (IMPORTANT - Do This First!)

### Step 1: Create Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (the one at: vwcoflkwoirnurdtdoya.supabase.co)
3. Click **"Storage"** in the left sidebar
4. Click **"New bucket"** button
5. Fill in:
   - **Name**: `products`
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
6. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

1. Still in Supabase Dashboard, go to **"SQL Editor"**
2. Click **"New query"**
3. Open the file `lib/setup_storage.sql` from your project
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

**That's it!** Storage is now ready.

---

## 🧪 Test It Out

1. Make sure your dev server is running:
   ```powershell
   npm run dev
   ```

2. Go to: http://localhost:3000

3. Log in to your account

4. Navigate to **"My Products"** → **"Add New Product"**

5. Try uploading an image:
   - Click the upload area, OR
   - Drag and drop an image onto it

6. You should see:
   - ✅ Image preview appears
   - ✅ Remove button (X) in top-right of preview
   - ✅ When you submit, it uploads and saves

---

## 🎨 How It Works

### For Users:
1. **Add Product**: Click upload area → Select image → Preview shows → Submit form
2. **Edit Product**: Current image shows → Upload new one to replace → Save changes
3. **Remove Image**: Click the red X button on the preview

### Technical Flow:
```
User selects image → Validate (type & size) → Show preview
    ↓
User submits form → Upload to Supabase Storage → Get public URL
    ↓
Save URL to database → Product displays with image
```

### Storage Structure:
```
Supabase Storage
└── products (bucket)
    └── product-images/
        └── {userId}-{timestamp}.jpg
```

Example: `123abc-1698765432000.jpg`

---

## 🐛 Troubleshooting

### "Failed to upload image"
**Fix**: Make sure you completed Step 1 & 2 above. The storage bucket must exist and be public.

### Image doesn't show after upload
**Fix**: Check that the bucket is marked as **Public** in Supabase Storage settings.

### "Please select an image file"
**Cause**: You tried to upload a non-image file (like PDF, Word doc, etc.)
**Fix**: Only upload PNG, JPG, GIF, WebP, or similar image files.

### "Image size must be less than 5MB"
**Cause**: The image file is too large
**Fix**: Compress the image or use a smaller file. Most phone photos are fine.

---

## 📝 Notes

- **Existing products**: If you already have products with URL images, they'll still work fine
- **URL vs Upload**: Users can choose either to upload a file OR enter a URL, but not both
- **File limit**: 5MB per image (good balance between quality and upload speed)
- **Supported formats**: PNG, JPG, JPEG, GIF, WebP, SVG
- **Public access**: Images are stored in a public bucket, so anyone can view them (needed for marketplace)

---

## ✨ What's Next?

After setting up storage, you can:
1. Add products with images
2. Edit existing products and change their images
3. See images in the marketplace
4. Images show in cart and orders

All image handling is automatic - just set up the storage bucket once and you're good to go! 🎉

---

## 📚 Additional Files

- `STORAGE_SETUP.md` - Detailed setup guide with screenshots descriptions
- `lib/setup_storage.sql` - SQL script for storage policies
- `lib/fix_role_constraint.sql` - Database role fix (if needed)

Need help? Check the full documentation in `STORAGE_SETUP.md`!
