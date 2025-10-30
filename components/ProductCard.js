import Link from 'next/link'

export default function ProductCard({ product, onAddToCart, showFarmerInfo = true, currentUserId = null, clickable = true }) {
  const isOwnProduct = currentUserId && product.farmer_id === currentUserId

  const cardContent = (
    <div className={`card overflow-hidden ${clickable ? 'cursor-pointer hover:shadow-2xl transition-all duration-300' : ''}`}>
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
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
        {isOwnProduct && (
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              Your Product
            </span>
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

        {showFarmerInfo && product.farmer_name && (
          <p className="text-sm text-gray-500 mb-3">
            by <span className="font-medium">{product.farmer_name}</span>
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              ₱{product.price}
              <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
            </p>
            {product.stock_quantity !== undefined && (
              <p className="text-sm text-gray-500">
                {product.stock_quantity} {product.unit}s available
              </p>
            )}
          </div>

          {onAddToCart && product.available && !isOwnProduct && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToCart(product)
              }}
              className="btn-primary text-sm py-2 px-4"
            >
              Add to Cart
            </button>
          )}
          {isOwnProduct && (
            <span className="text-sm text-blue-600 font-medium">
              Your Product
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (clickable) {
    return (
      <Link href={`/product/${product.id}`}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
