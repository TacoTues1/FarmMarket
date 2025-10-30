-- Database Schema for Local Farmers' Marketplace System
-- Run this in your Supabase SQL Editor
--
-- PROJECT OBJECTIVES:
-- General: Design, develop, and implement a web-based platform that serves as a bridge
--          between local farmers and consumers, simplifying agricultural trade through
--          fairer pricing, greater transparency, and wider accessibility.
--
-- Specific: Enable farmers to register, manage products, and interact with consumers
--          while providing core features like product management, order placement,
--          messaging, and farmer profiles.
--
-- Measurable: Target 80% positive feedback from 20+ users (farmers and consumers)
--            on accessibility, ease of use, and transaction efficiency.
--
-- Achievable: Developed using Next.js, React, Supabase, and modern web technologies
--            with team expertise and available resources.
--
-- Relevant: Addresses demand for sustainable food sources, reduces farmer dependence
--          on middlemen, increases profitability, and provides consumers with fresh
--          produce at competitive prices, contributing to food security and economic resilience.
--
-- Technology Stack: Next.js 14, React 18, Supabase (PostgreSQL), TailwindCSS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profile Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmer Details Table
CREATE TABLE farmer_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  farm_name TEXT NOT NULL,
  farm_location TEXT NOT NULL,
  farm_size TEXT,
  farming_type TEXT, -- organic, conventional, etc.
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- vegetables, fruits, grains, dairy, etc.
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- kg, lb, piece, dozen, etc.
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  delivery_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- order, message, review, etc.
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_orders_consumer ON orders(consumer_id);
CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Farmer details policies
CREATE POLICY "Farmer details viewable by everyone" ON farmer_details
  FOR SELECT USING (true);

CREATE POLICY "Farmers can update own details" ON farmer_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own details" ON farmer_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Products viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Farmers can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own products" ON products
  FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own products" ON products
  FOR DELETE USING (auth.uid() = farmer_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = consumer_id OR auth.uid() = farmer_id);

CREATE POLICY "Consumers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Farmers and consumers can update orders" ON orders
  FOR UPDATE USING (auth.uid() = consumer_id OR auth.uid() = farmer_id);

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.consumer_id = auth.uid() OR orders.farmer_id = auth.uid())
    )
  );

CREATE POLICY "Consumers can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.consumer_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Reviews policies
CREATE POLICY "Reviews viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Consumers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Consumers can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = consumer_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification on new order
CREATE OR REPLACE FUNCTION notify_farmer_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link)
  VALUES (
    NEW.farmer_id,
    'New Order Received',
    'You have received a new order #' || NEW.id,
    'order',
    '/farmer/orders/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_farmer_new_order();

-- Function to create notification on order status update
CREATE OR REPLACE FUNCTION notify_consumer_order_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.consumer_id,
      'Order Status Updated',
      'Your order #' || NEW.id || ' is now ' || NEW.status,
      'order',
      '/consumer/orders/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_status_change AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_consumer_order_status();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone, address)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
