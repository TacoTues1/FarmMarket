'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id

  const [user, setUser] = useState(null)
  const [product, setProduct] = useState(null)
  const [farmer, setFarmer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [userReview, setUserReview] = useState(null) // Track user's existing review
  const [isEditingReview, setIsEditingReview] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchProductDetails()
  }, [productId])

  useEffect(() => {
    // Re-fetch reviews when user changes to check for existing reviews
    if (user && product) {
      fetchReviews()
    }
  }, [user])

  // Auto-slide images every 5 seconds
  useEffect(() => {
    if (!product || !product.image_urls || product.image_urls.length <= 1) return

    const interval = setInterval(() => {
      setSelectedImage((prev) => {
        const imageCount = product.image_urls.length
        return (prev + 1) % imageCount
      })
    }, 1500) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [product])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    setAuthChecked(true)
  }

  const fetchProductDetails = async () => {
    try {
      // Fetch product with farmer details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          farmer:farmer_id (
            id,
            full_name,
            email,
            phone,
            address,
            created_at
          )
        `)
        .eq('id', productId)
        .single()

      if (productError) throw productError

      setProduct(productData)
      setFarmer(productData.farmer)

      // Fetch reviews
      fetchReviews()

      // Fetch related products (same category, different farmer)
      fetchRelatedProducts(productData.category, productData.farmer_id)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product details')
      router.push('/marketplace')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_id (
            full_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
      
      // Check if current user has already reviewed
      if (user) {
        const existingReview = data?.find(review => review.user_id === user.id)
        setUserReview(existingReview || null)
        if (existingReview) {
          setRating(existingReview.rating)
          setComment(existingReview.comment)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchRelatedProducts = async (category, farmerId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farmer:farmer_id (
            full_name
          )
        `)
        .eq('category', category)
        .eq('available', true)
        .neq('id', productId)
        .limit(4)

      if (error) throw error
      
      // Add farmer_name to each product
      const productsWithFarmerName = data?.map(p => ({
        ...p,
        farmer_name: p.farmer?.full_name
      })) || []
      
      setRelatedProducts(productsWithFarmerName)
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleAddToCart = () => {
    // Don't allow adding to cart until auth is checked
    if (!authChecked) {
      toast.error('Please wait, checking authentication...')
      return
    }

    if (!user) {
      toast.error('Please log in to add items to cart')
      router.push('/auth/login')
      return
    }

    if (user.id === product.farmer_id) {
      toast.error('You cannot buy your own product!')
      return
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image_url: product.image_url,
        farmer_id: product.farmer_id,
        farmer_name: farmer.full_name,
        quantity: quantity,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`${quantity} ${product.unit}(s) of ${product.name} added to cart!`)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please log in to leave a review')
      router.push('/auth/login')
      return
    }

    setSubmittingReview(true)
    try {
      // Verify user profile exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError || !profileData) {
        console.error('Profile not found:', profileError)
        toast.error('Your profile is not set up correctly. Please log out and log in again.')
        setSubmittingReview(false)
        return
      }

      console.log('User profile verified:', profileData.id)

      // Double-check if user already has a review (in case state is stale)
      const { data: existingReviews, error: checkError } = await supabase
        .from('reviews')
        .select('id, rating, comment')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing reviews:', checkError)
      }

      console.log('Existing review check:', existingReviews)
      console.log('Current userReview state:', userReview)

      if (existingReviews && !userReview) {
        // User has a review but state wasn't updated
        setUserReview(existingReviews)
        toast.error('You already reviewed this product. Click "Edit My Review" to update it.')
        setSubmittingReview(false)
        setShowReviewForm(false)
        await fetchReviews()
        return
      }

      if (userReview || existingReviews) {
        // Update existing review
        const reviewId = userReview?.id || existingReviews.id
        console.log('Updating review with ID:', reviewId)
        
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: rating,
            comment: comment.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewId)

        if (error) throw error
        toast.success('Review updated successfully!')
      } else {
        // Insert new review
        console.log('Inserting new review for user:', user.id)
        
        const { data: newReview, error } = await supabase
          .from('reviews')
          .insert({
            product_id: productId,
            user_id: user.id,
            rating: rating,
            comment: comment.trim()
          })
          .select()

        if (error) {
          console.error('Insert error details:', error)
          throw error
        }
        
        console.log('New review created:', newReview)
        toast.success('Review submitted successfully!')
      }

      setShowReviewForm(false)
      setIsEditingReview(false)
      await fetchReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      
      if (error.code === '23505') { // Unique constraint violation
        toast.error('You have already reviewed this product. Refreshing...')
        await fetchReviews()
        setShowReviewForm(false)
      } else if (error.code === '23503') { // Foreign key violation
        toast.error('Profile error. Please log out and log back in.')
      } else {
        toast.error(`Failed to submit review: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const handleDeleteReview = async () => {
    if (!userReview || !confirm('Are you sure you want to delete your review?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id)

      if (error) throw error

      toast.success('Review deleted successfully!')
      setUserReview(null)
      setRating(5)
      setComment('')
      setShowReviewForm(false)
      setIsEditingReview(false)
      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    }
  }

  const renderStars = (rating, size = 'text-xl') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${size} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
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

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <Link href="/marketplace" className="btn-primary">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </>
    )
  }

  const averageRating = calculateAverageRating()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/marketplace" className="hover:text-primary-600">Marketplace</Link>
              <span>/</span>
              <span className="capitalize">{product.category}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Product Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Images Carousel */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Main Image */}
                <div className="relative h-96 bg-gray-200">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <>
                      <img
                        src={product.image_urls[selectedImage]}
                        alt={`${product.name} - Image ${selectedImage + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                      
                      {/* Navigation Arrows */}
                      {product.image_urls.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedImage((prev) => (prev - 1 + product.image_urls.length) % product.image_urls.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setSelectedImage((prev) => (prev + 1) % product.image_urls.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            {selectedImage + 1} / {product.image_urls.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {!product.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {product.image_urls && product.image_urls.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {product.image_urls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full capitalize">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-primary-600">₱{product.price}</p>
                    <p className="text-gray-500">per {product.unit}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-lg font-semibold text-gray-900">{averageRating}</span>
                  <span className="text-gray-500">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Stock */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                  <p className="text-gray-600">
                    {product.available ? (
                      <>
                        <span className="text-green-600 font-semibold">In Stock</span>
                        {' - '}
                        {product.stock_quantity} {product.unit}(s) available
                      </>
                    ) : (
                      <span className="text-red-600 font-semibold">Out of Stock</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  {user && user.id !== product.farmer_id && (
                    <div className="flex gap-2">
                      {userReview && !showReviewForm && (
                        <button
                          onClick={handleDeleteReview}
                          className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete My Review
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowReviewForm(!showReviewForm)
                          setIsEditingReview(!!userReview)
                        }}
                        className="btn-primary text-sm"
                      >
                        {showReviewForm ? 'Cancel' : userReview ? 'Edit My Review' : 'Write a Review'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    {userReview && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ✏️ You're editing your existing review
                        </p>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <svg
                              className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="input-field"
                        placeholder="Share your experience with this product..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn-primary disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.user?.full_name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          {renderStars(review.rating, 'text-lg')}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Seller Info & Purchase */}
            <div className="lg:col-span-1 space-y-6">

              {/* Seller Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-700">
                      {farmer?.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{farmer?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(farmer?.created_at).getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {farmer?.email && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{farmer.email}</span>
                    </div>
                  )}
                  
                  {farmer?.phone && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{farmer.phone}</span>
                    </div>
                  )}
                  
                  {farmer?.address && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">{farmer.address}</span>
                    </div>
                  )}
                </div>

                {user && user.id !== product.farmer_id && (
                  <Link
                    href={`/messages?user=${farmer?.id}`}
                    className="mt-4 btn-secondary w-full text-center"
                  >
                    Contact Seller
                  </Link>
                )}
              </div>
              {/* Purchase Card */}
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add to Cart</h3>
                
                {!authChecked ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                ) : !user ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Please log in to add items to your cart</p>
                    <Link href="/auth/login" className="btn-primary w-full">
                      Log In
                    </Link>
                  </div>
                ) : user.id === product.farmer_id ? (
                  <div className="text-center py-4">
                    <p className="text-blue-600 font-medium mb-4">This is your product</p>
                    <Link href="/farmer/products" className="btn-secondary w-full">
                      Manage Products
                    </Link>
                  </div>
                ) : !product.available ? (
                  <div className="text-center py-4 text-red-600 font-medium">
                    Currently unavailable
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity ({product.unit})
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock_quantity}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                          className="flex-1 text-center input-field"
                        />
                        <button
                          onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Price per {product.unit}:</span>
                        <span className="font-semibold">₱{product.price}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total:</span>
                        <span className="text-primary-600">₱{(product.price * quantity).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={!authChecked || !user}
                      className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <ProductCard
                      product={relatedProduct}
                      showFarmerInfo={true}
                      currentUserId={user?.id}
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
