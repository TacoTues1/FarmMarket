'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function FarmerProductsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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
    fetchProducts(currentUser.id)
  }

  const fetchProducts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !product.available })
        .eq('id', product.id)

      if (error) throw error

      setProducts(products.map(p =>
        p.id === product.id ? { ...p, available: !p.available } : p
      ))
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      setProducts(products.filter(p => p.id !== productId))
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
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
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Products</h1>
                <p className="text-gray-700 mt-2">Manage your product listings</p>
              </div>
              <Link href="/farmer/products/new" className="btn-primary">
                + Add New Product
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first product listing</p>
              <Link href="/farmer/products/new" className="btn-primary">
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="card overflow-hidden">
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {!product.available && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Unavailable</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                        {product.category}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    )}

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary-600">
                        ₱{product.price}
                        <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {product.stock_quantity} {product.unit}s
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                          product.available
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {product.available ? 'Hide' : 'Show'}
                      </button>
                      <Link
                        href={`/farmer/products/${product.id}/edit`}
                        className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 text-center transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="py-2 px-3 rounded-lg font-medium text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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
