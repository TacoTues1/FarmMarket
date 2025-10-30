# Local Farmers' Marketplace System

A modern web-based platform connecting local farmers directly with consumers through transparent and efficient online marketplace.

## 🌾 Features

### For Consumers
- Browse fresh local produce from verified farmers
- Search and filter products by category
- Add products to cart and place orders
- Track order status in real-time
- Direct messaging with farmers
- View order history and receipts

### For Farmers
- Create and manage product listings
- Track orders and sales
- Update product inventory and prices
- View analytics dashboard with revenue insights
- Communicate directly with customers
- Manage farm profile and details

### System Features
- Secure authentication with role-based access
- Real-time notifications
- Responsive design for mobile and desktop
- Image upload for products
- Order management system
- Review and rating system

## 🚀 Technology Stack

- **Frontend**: Next.js 14, React 18, JavaScript (JSX)
- **Styling**: TailwindCSS, PostCSS
- **Backend**: Supabase (Authentication, Database, Real-time)
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18.x or higher
- npm or yarn
- A Supabase account (free tier available)
- Git

## 🛠️ Installation

### 1. Clone the repository (if from Git)
```bash
git clone <your-repo-url>
cd fortest
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon public key

### 4. Create environment file
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set up the database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `lib/database.sql`
4. Paste and run the SQL script

This will create:
- All necessary tables (profiles, products, orders, messages, etc.)
- Row Level Security (RLS) policies
- Indexes for better performance
- Triggers for notifications

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
fortest/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── farmer/             # Farmer dashboard
│   │   ├── dashboard/      # Main dashboard
│   │   ├── products/       # Product management
│   │   └── orders/         # Order management
│   ├── consumer/           # Consumer pages
│   │   ├── orders/         # Order history
│   │   └── cart/           # Shopping cart
│   ├── marketplace/        # Product browsing
│   ├── messages/           # Messaging system
│   ├── layout.js           # Root layout
│   ├── page.js             # Homepage
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   ├── Navbar.js          # Navigation bar
│   ├── ProductCard.js     # Product display card
│   └── ...
├── lib/                    # Utility functions
│   ├── supabase.js        # Supabase client & auth helpers
│   └── database.sql       # Database schema
├── public/                 # Static assets
├── .env.local.example     # Environment variables template
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # TailwindCSS configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies
```

## 🎨 Key Pages

### Public Pages
- `/` - Homepage with features and call-to-action
- `/marketplace` - Browse all products
- `/auth/login` - User login
- `/auth/register` - User registration (Farmer/Consumer)

### Farmer Pages (Protected)
- `/farmer/dashboard` - Analytics and overview
- `/farmer/products` - Manage products
- `/farmer/products/new` - Add new product
- `/farmer/orders` - View and manage orders

### Consumer Pages (Protected)
- `/consumer/orders` - Order history
- `/consumer/cart` - Shopping cart

### Shared Pages
- `/messages` - Direct messaging between farmers and consumers

## 🔐 Authentication

The system uses Supabase Authentication with role-based access control:
- Users register as either **Farmer** or **Consumer**
- Roles determine access to different parts of the application
- Row Level Security (RLS) ensures data privacy

## 💾 Database Schema

Main tables:
- `profiles` - User information (extends auth.users)
- `farmer_details` - Farmer-specific information
- `products` - Product listings
- `orders` - Customer orders
- `order_items` - Individual order items
- `messages` - Direct messages
- `reviews` - Product and farmer reviews
- `notifications` - Real-time notifications

## 🎯 Usage Guide

### For Farmers

1. **Register** as a Farmer with farm details
2. **Add Products**:
   - Navigate to Dashboard → Add New Product
   - Fill in product details (name, price, category, stock)
   - Upload product image
3. **Manage Orders**:
   - View incoming orders in real-time
   - Update order status (pending → confirmed → preparing → ready → completed)
4. **Track Performance**:
   - View sales analytics
   - Monitor product performance
   - Check revenue metrics

### For Consumers

1. **Register** as a Consumer
2. **Browse Products**:
   - Use search and filters to find products
   - View farmer profiles and farm details
3. **Place Orders**:
   - Add products to cart
   - Checkout with delivery address
   - Track order status
4. **Communicate**:
   - Message farmers directly for inquiries

## 🚀 Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## 🔧 Configuration

### TailwindCSS Customization

Edit `tailwind.config.js` to customize colors, spacing, etc.

### Supabase Storage (for images)

1. Go to Supabase Dashboard → Storage
2. Create a bucket named `product-images`
3. Set it to public
4. Update image upload functionality in product forms

## 📝 Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in `.env.local`
- Check if database schema is properly set up
- Ensure RLS policies are enabled

### Authentication Issues
- Clear browser cache and cookies
- Check Supabase authentication settings
- Verify email confirmation settings

### Build Errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Check for any missing dependencies

## 🤝 Contributing

This is a student project for educational purposes. Feedback and suggestions are welcome!

## 📄 License

This project is created for educational purposes.

## 👥 Support

For issues and questions:
- Check the documentation
- Review Supabase logs
- Consult Next.js documentation

## 🎓 Educational Context

This project demonstrates:
- Full-stack web development with Next.js and Supabase
- React hooks (useState, useEffect)
- Responsive design with TailwindCSS
- RESTful API patterns
- Database design and relationships
- Authentication and authorization
- Real-time features
- Role-based access control

## 🔮 Future Enhancements

Potential improvements:
- Payment integration (Stripe, PayPal)
- Real-time chat with WebSockets
- Advanced analytics dashboard
- Mobile app (React Native)
- Email notifications
- Product reviews and ratings
- Wishlist functionality
- Social media integration
- Multi-language support

---

**Built with ❤️ for local farmers and sustainable agriculture**
