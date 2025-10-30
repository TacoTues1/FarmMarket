'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewProductPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    stock_quantity: '',
    image_url: '',
  })
  const [error, setError] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [uploading, setUploading] = useState(false)

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
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Check total number of images
    if (imageFiles.length + files.length > 10) {
      toast.error('Maximum 10 images allowed per product')
      return
    }

    // Validate each file
    const validFiles = []
    const newPreviews = []

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }

      validFiles.push(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result)
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    }

    setImageFiles([...imageFiles, ...validFiles])
  }

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (imageFiles.length === 0) return []

    setUploading(true)
    try {
      const uploadedUrls = []

      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `product-images/${fileName}`

        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      return uploadedUrls
    } catch (error) {
      console.error('Error uploading images:', error)
      throw new Error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!formData.name || !formData.price || !formData.stock_quantity) {
        throw new Error('Please fill in all required fields')
      }

      if (parseFloat(formData.price) <= 0) {
        throw new Error('Price must be greater than 0')
      }

      if (parseInt(formData.stock_quantity) < 0) {
        throw new Error('Stock quantity cannot be negative')
      }

      // Upload image if selected
      let imageUrl = formData.image_url
      let imageUrls = []
      
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages()
        // Store first image as primary image_url for backwards compatibility
        imageUrl = uploadedUrls[0]
        // Store all images in image_urls array
        imageUrls = uploadedUrls
      }

      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert({
          farmer_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          unit: formData.unit,
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: imageUrl || null,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          available: true,
        })
        .select()

      if (error) throw error

      toast.success('Product added successfully!')
      router.push('/farmer/products')
    } catch (error) {
      setError(error.message)
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-700 mt-2">List a new product for sale</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Category and Unit */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                    <option value="herbs">Herbs</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="lb">Pound (lb)</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                    <option value="bunch">Bunch</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit (₱) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Up to 10)
                </label>
                
                {/* Image Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* File Input */}
                {imagePreviews.length < 10 && (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                        <p className="text-xs text-primary-600 font-medium mt-1">
                          {imagePreviews.length}/10 images uploaded
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {imagePreviews.length >= 10 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-700 font-medium">✓ Maximum 10 images uploaded</p>
                    <p className="text-sm text-green-600 mt-1">Remove an image to add a different one</p>
                  </div>
                )}

                {/* Optional URL Input */}
                {imagePreviews.length === 0 && (
                  <div className="mt-4">
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter image URL
                    </label>
                    <input
                      id="image_url"
                      name="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                      disabled={imageFiles.length > 0}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Upload images or enter a URL (not both)
                    </p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? `Uploading ${imageFiles.length} image(s)...` : loading ? 'Adding Product...' : 'Add Product'}
                </button>
                <Link
                  href="/farmer/products"
                  className="flex-1 btn-secondary text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
