'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'

export default function FarmerOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const statuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

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
          consumer:consumer_id (full_name, email, phone),
          order_items (
            *,
            product:product_id (name, unit)
          )
        `)
        .eq('farmer_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

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
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-700 mt-2">Manage customer orders</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-2 text-xs">
                      ({orders.filter(o => o.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'You have no orders yet' : `No ${filter} orders`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-900 font-medium">{order.consumer?.full_name}</p>
                          <p className="text-gray-600">{order.consumer?.email}</p>
                          {order.consumer?.phone && (
                            <p className="text-gray-600">{order.consumer.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Delivery Address</h4>
                        <p className="text-sm text-gray-900">{order.delivery_address}</p>
                        {order.notes && (
                          <div className="mt-2">
                            <p className="text-sm font-semibold text-gray-700">Notes:</p>
                            <p className="text-sm text-gray-600">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items?.map(item => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium text-gray-900">{item.product?.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} {item.product?.unit}(s) × ₱{parseFloat(item.price_at_purchase).toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              ₱{parseFloat(item.subtotal).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Status Update Actions */}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-700 py-2">Update Status:</span>
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm"
                            >
                              Confirm Order
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-sm"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-sm"
                          >
                            Mark as Ready
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-sm"
                          >
                            Complete Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
