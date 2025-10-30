'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ConsumerCartPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
    loadCart()
  }, [])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
    setDeliveryAddress(currentUser.user_metadata?.address || '')
  }

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
    setCart(newCart)
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )
    saveCart(newCart)
  }

  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.id !== productId)
    saveCart(newCart)
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address')
      return
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      // Group items by farmer
      const ordersByFarmer = cart.reduce((acc, item) => {
        if (!acc[item.farmer_id]) {
          acc[item.farmer_id] = []
        }
        acc[item.farmer_id].push(item)
        return acc
      }, {})

      // Create orders for each farmer
      for (const [farmerId, items] of Object.entries(ordersByFarmer)) {
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        // In a real app, you would use Supabase here
        // For now, we'll just simulate the order creation
        console.log('Creating order:', {
          consumer_id: user.id,
          farmer_id: farmerId,
          items: items,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          notes: notes,
        })
      }

      // Clear cart
      saveCart([])
      toast.success('Orders placed successfully! You will receive confirmation soon.')
      router.push('/consumer/orders')
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-700 mt-2">Review your items and checkout</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {cart.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">Browse our marketplace and add products to your cart</p>
                  <Link href="/marketplace" className="btn-primary inline-block">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                      Cart Items ({cart.length})
                    </h2>
                  </div>

                  <div className="divide-y">
                    {cart.map(item => (
                      <div key={item.id} className="p-6 flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">by {item.farmer_name}</p>
                          <p className="text-lg font-bold text-primary-600 mt-2">
                            ₱{item.price}/{item.unit}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cart.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  {/* Delivery Address */}
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="input-field"
                      placeholder="Enter your delivery address..."
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field"
                      placeholder="Any special instructions..."
                    />
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">₱{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="font-semibold">TBD</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                    <span>Total</span>
                    <span className="text-primary-600">₱{calculateSubtotal().toFixed(2)}</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>

                  <Link
                    href="/marketplace"
                    className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
