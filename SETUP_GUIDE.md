# Local Farmers' Marketplace - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

Follow these steps to get your marketplace up and running!

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- Next.js
- React
- Supabase client
- TailwindCSS
- PostCSS
- And more...

### Step 2: Set Up Supabase

#### 2.1 Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email

#### 2.2 Create a New Project
1. Click "New Project"
2. Fill in:
   - Project name: `farmers-marketplace`
   - Database password: (create a strong password - save it!)
   - Region: Choose closest to you
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete

#### 2.3 Get Your API Credentials
1. In your project dashboard, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

#### 2.4 Configure Your Application
1. In your project folder, rename `.env.local.example` to `.env.local`
2. Open `.env.local` and paste your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Set Up the Database

#### 3.1 Open SQL Editor
1. In Supabase dashboard, click **SQL Editor** (icon looks like `</>`)
2. Click **New query**

#### 3.2 Run Database Script
1. Open the file `lib/database.sql` in your project
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success. No rows returned" message

This creates:
- ✅ All database tables
- ✅ Security policies
- ✅ Triggers for notifications
- ✅ Database functions

### Step 4: Run the Application

Start the development server:

```bash
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
- Ready in X seconds
```

### Step 5: Test the Application

Open your browser and go to: **http://localhost:3000**

You should see the homepage! 🎉

## 🧪 Testing the Features

### Test as a Farmer

1. Click "Get Started" or "Register"
2. Fill in the form and select **"Farmer"**
3. Complete farm information
4. Click "Create Account"
5. You'll be redirected to the Farmer Dashboard

**Try these actions:**
- Click "Add New Product" to list a product
- Fill in product details (name, price, category, etc.)
- View your dashboard statistics
- Check the "My Products" page

### Test as a Consumer

1. Open a new **incognito/private window**
2. Go to http://localhost:3000
3. Click "Register" and select **"Consumer"**
4. Fill in your details
5. Click "Create Account"

**Try these actions:**
- Browse the marketplace
- Search and filter products
- Add products to cart
- View cart and checkout

## 📊 Verify Database Setup

Check if tables were created correctly:

1. In Supabase dashboard, click **Table Editor**
2. You should see these tables:
   - profiles
   - farmer_details
   - products
   - orders
   - order_items
   - messages
   - reviews
   - notifications

## 🔧 Troubleshooting

### Problem: "Supabase credentials not found"
**Solution:** Make sure `.env.local` file exists and has correct credentials

### Problem: "Database error" when registering
**Solution:** Run the SQL script again in Supabase SQL Editor

### Problem: "Module not found" errors
**Solution:** Delete `node_modules` folder and run `npm install` again

### Problem: CSS not working properly
**Solution:** 
1. Stop the server (Ctrl+C)
2. Delete `.next` folder
3. Run `npm run dev` again

### Problem: Can't see products in marketplace
**Solution:** Make sure you've created products as a farmer first

## 🎨 Customization Tips

### Change Colors
Edit `tailwind.config.js` and modify the `primary` color values

### Change Logo/Name
Edit `components/Navbar.js` and update the logo and text

### Add More Product Categories
Edit pages that have category lists and add your categories

## 📱 Building for Production

When ready to deploy:

```bash
npm run build
npm run start
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables (same as `.env.local`)
5. Click "Deploy"

## 🎓 Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

## 📝 Project Structure Reference

```
fortest/
├── app/                    # Pages
│   ├── auth/              # Login & Register
│   ├── farmer/            # Farmer pages
│   ├── consumer/          # Consumer pages
│   ├── marketplace/       # Product browsing
│   └── page.js           # Homepage
├── components/            # Reusable UI components
├── lib/                   # Helper functions
│   ├── supabase.js       # Database client
│   └── database.sql      # Database schema
└── public/               # Static files

```

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] Environment variables configured (`.env.local`)
- [ ] Database schema applied (SQL script run)
- [ ] Development server running (`npm run dev`)
- [ ] Homepage loads at http://localhost:3000
- [ ] Can register as Farmer
- [ ] Can register as Consumer
- [ ] Can create products (as Farmer)
- [ ] Can browse marketplace (as Consumer)
- [ ] Can add to cart (as Consumer)

## 🎉 You're All Set!

Your Local Farmers' Marketplace is ready to use. Start exploring the features and building your agricultural e-commerce platform!

For questions or issues, refer to:
- README.md (detailed documentation)
- Check browser console for errors
- Review Supabase logs in dashboard

Happy coding! 🌾
