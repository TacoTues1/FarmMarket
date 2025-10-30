'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getCurrentUser, signOut } from '@/lib/supabase'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50" data-scroll-locked="true">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Tagline */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="hidden lg:block">
                <div className="text-xl font-bold text-gray-900">FarmMarket</div>
                <div className="text-xs text-gray-600 -mt-1">Fresh Local Produce</div>
              </div>
              <span className="lg:hidden text-xl font-bold text-gray-900">FarmMarket</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <>
                  <Link
                    href="/marketplace"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/marketplace'
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Marketplace</span>
                  </Link>
                  
                  <Link
                    href="/consumer/cart"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/consumer/cart'
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Cart</span>
                  </Link>
                </>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{user.user_metadata?.full_name || user.email}</span>
                    <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      
                      {/* Dropdown */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                        <Link
                          href="/farmer/products"
                          onClick={() => setDropdownOpen(false)}
                          className={`block px-4 py-2 text-sm ${
                            pathname === '/farmer/products'
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          My Products
                        </Link>
                        <Link
                          href="/consumer/orders"
                          onClick={() => setDropdownOpen(false)}
                          className={`block px-4 py-2 text-sm ${
                            pathname === '/consumer/orders'
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setDropdownOpen(false)}
                          className={`block px-4 py-2 text-sm ${
                            pathname === '/messages'
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Messages
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className={`block px-4 py-2 text-sm ${
                            pathname === '/settings'
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Settings
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            handleSignOut()
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Login
                  </Link>
                  <Link href="/auth/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-16 bg-white shadow-lg z-50 md:hidden border-t">
                <div className="container mx-auto px-4 py-4">
                  <div className="flex flex-col space-y-4">
                    {user ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.full_name || user.email}
                          </p>
                        </div>
                        <Link 
                          href="/marketplace" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-primary-600 flex items-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Marketplace</span>
                        </Link>
                        <Link 
                          href="/consumer/cart" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-primary-600 flex items-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>Cart</span>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link 
                          href="/farmer/products" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-primary-600"
                        >
                          My Products
                        </Link>
                        <Link 
                          href="/consumer/orders" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-primary-600"
                        >
                          My Orders
                        </Link>
                        <Link 
                          href="/messages" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-primary-600"
                        >
                          Messages
                        </Link>
                        <Link 
                          href="/settings" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-primary-600"
                        >
                          Settings
                        </Link>
                        <button 
                          onClick={() => {
                            setMobileMenuOpen(false)
                            handleSignOut()
                          }} 
                          className="text-left text-red-600 hover:text-red-700 font-medium"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/auth/login" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-primary-600"
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/auth/register" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="btn-primary inline-block text-center"
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </>
    )
  }
