'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function ConsumerOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
    fetchOrders(currentUser.id)
  }

  const fetchOrders = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          farmer:farmer_id (
            full_name,
            farmer_details (farm_name)
          )
        `)
        .eq('consumer_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const ordersWithFarmerInfo = data.map(order => ({
        ...order,
        farmer_name: order.farmer?.farmer_details?.[0]?.farm_name || order.farmer?.full_name || 'Unknown Farmer'
      }))

      setOrders(ordersWithFarmerInfo)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderItems = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id (
            name,
            category,
            unit,
            image_url
          )
        `)
        .eq('order_id', orderId)

      if (error) throw error
      setOrderItems(data || [])
    } catch (error) {
      console.error('Error fetching order items:', error)
    }
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    fetchOrderItems(order.id)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'confirmed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'preparing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        )
      case 'ready':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
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
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to place your first order</p>
              <a href="/marketplace" className="btn-primary inline-block">
                Browse Products
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-lg font-semibold text-gray-900">{order.farmer_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Delivery Address:</span> {order.delivery_address}
                      </p>
                      {order.notes && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="btn-secondary text-sm"
                      >
                        View Details
                      </button>
                      {order.status === 'pending' && (
                        <a href="/messages" className="btn-primary text-sm">
                          Contact Farmer
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                      <p className="text-gray-600">Order #{selectedOrder.id.slice(0, 8)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Farmer</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.farmer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.delivery_address}</p>
                    </div>
                    {selectedOrder.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {orderItems.map(item => (
                        <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                            {item.product?.image_url ? (
                              <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.product?.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{item.product?.category}</p>
                            <p className="text-sm text-gray-600">
                              ₱{item.price_at_purchase} × {item.quantity} {item.product?.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary-600">
                              ₱{parseFloat(item.subtotal).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-primary-600">
                          ₱{parseFloat(selectedOrder.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
