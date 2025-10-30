'use client'

import { useState, useEffect } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import toast from 'react-hot-toast'

export default function MarketplacePage() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'other']

  useEffect(() => {
    checkUser()
    fetchProducts()
    loadCart()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farmer:farmer_id (
            full_name,
            farmer_details (farm_name)
          )
        `)
        .eq('available', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const productsWithFarmerInfo = data.map(product => ({
        ...product,
        farmer_name: product.farmer?.farmer_details?.[0]?.farm_name || product.farmer?.full_name || 'Unknown Farmer'
      }))

      setProducts(productsWithFarmerInfo)
      setFilteredProducts(productsWithFarmerInfo)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmer_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
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

  const handleAddToCart = (product) => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to add items to cart')
      return
    }

    // Prevent adding own products to cart
    if (user && product.farmer_id === user.id) {
      toast.error('You cannot buy your own product!')
      return
    }

    const existingItem = cart.find(item => item.id === product.id)
    let newCart

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }

    saveCart(newCart)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter - Minimal Centered */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex gap-3">
              {/* Search */}
              <div className="flex-1">
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, farmers..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="w-48">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-3 text-center text-sm text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  showFarmerInfo={true}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
