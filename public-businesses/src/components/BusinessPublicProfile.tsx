'use client';

import { useBusiness } from '@/context/BusinessContext';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const BusinessPublicProfile = (props: any) => {
  const { error, businessData, loading, categories, activeCategory, setActiveCategory } = useBusiness();
  
  // Image loading states
  const [bannerLoading, setBannerLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [productImagesLoading, setProductImagesLoading] = useState<Record<string, boolean>>({});
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Refs to track loaded images
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const totalImagesRef = useRef<number>(0);
  
  const filteredProducts = activeCategory
    ? businessData?.products.filter(product => product.categories.includes(activeCategory))
    : businessData?.products;

  // Calculate total number of images that need to be loaded
  useEffect(() => {
    if (businessData) {
      let total = 0;
      if (businessData.bannerMedia) total++;
      if (businessData.picture) total++;
      if (filteredProducts) {
        filteredProducts.forEach(product => {
          if (product.picture) total++;
        });
      }
      totalImagesRef.current = total;
      setLoadingProgress(0);
      loadedImagesRef.current.clear();
    }
  }, [businessData, filteredProducts]);

  // Verify when all images are loaded
  useEffect(() => {
    if (!businessData || totalImagesRef.current === 0) {
      setAllImagesLoaded(false);
      return;
    }

    const bannerLoaded = !businessData.bannerMedia || !bannerLoading;
    const profileLoaded = !businessData.picture || !profileLoading;
    
    // Check if all product images are loaded
    let productsLoaded = true;
    if (filteredProducts && filteredProducts.length > 0) {
      productsLoaded = filteredProducts.every(product => {
        // If product has no picture, consider it loaded
        if (!product.picture) return true;
        // If we haven't tracked this product yet, it's not loaded
        if (productImagesLoading[product._id] === undefined) return false;
        // Return true if loading is complete
        return productImagesLoading[product._id] === false;
      });
    }

    const allLoaded = bannerLoaded && profileLoaded && productsLoaded;
    
    if (allLoaded) {
      setAllImagesLoaded(true);
    } else {
      // Calculate loading progress
      const loadedCount = loadedImagesRef.current.size;
      const progress = totalImagesRef.current > 0 
        ? Math.min(Math.round((loadedCount / totalImagesRef.current) * 100), 99)
        : 0;
      setLoadingProgress(progress);
    }
  }, [bannerLoading, profileLoading, productImagesLoading, businessData, filteredProducts]);

  // Handle individual image load
  const handleImageLoad = (imageId: string, type: 'banner' | 'profile' | 'product') => {
    loadedImagesRef.current.add(`${type}-${imageId}`);
    
    switch (type) {
      case 'banner':
        setBannerLoading(false);
        break;
      case 'profile':
        setProfileLoading(false);
        break;
      case 'product':
        setProductImagesLoading(prev => ({
          ...prev,
          [imageId]: false
        }));
        break;
    }
  };

  // Handle image load error
  const handleImageError = (imageId: string, type: 'banner' | 'profile' | 'product') => {
    // Still mark as loaded even if error occurred
    loadedImagesRef.current.add(`${type}-${imageId}`);
    
    switch (type) {
      case 'banner':
        setBannerLoading(false);
        break;
      case 'profile':
        setProfileLoading(false);
        break;
      case 'product':
        setProductImagesLoading(prev => ({
          ...prev,
          [imageId]: false
        }));
        break;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading business data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="p-4 text-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Business not found
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Loading Overlay */}
      {!allImagesLoaded && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 z-50 flex flex-col justify-center items-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-500"></div>
          </div>
          <div className="w-64 max-w-full px-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Loading images... {loadingProgress}%
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800 transition-opacity duration-300 ${
        allImagesLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Business Header */}
        <div className="relative">
          {businessData.bannerMedia && (
            <div className="relative w-full h-64 rounded-t-lg overflow-hidden">
              {bannerLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
              <Image
                src={businessData.bannerMedia}
                alt={`${businessData.name} banner`}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          )}
          
          {businessData.picture && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white">
              {profileLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
              <Image
                src={businessData.picture}
                alt={businessData.name}
                width={128}
                height={128}
                className="rounded-full object-cover"
                priority
              />
            </div>
          )}
        </div>
        
        {/* Business Info */}
        <div className="pt-16 text-center">
          <h1 className="text-4xl font-bold">{businessData.name}</h1>
          {businessData.aboutUs && (
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
              {businessData.aboutUs}
            </p>
          )}
        </div>

        {/* Delivery Badge */}
        {businessData.deliveryAvailable && (
          <div className="text-center">
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              🚚 Delivery Available
            </span>
          </div>
        )}

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 my-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-md transition-colors ${
                !activeCategory 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              All Products
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeCategory === category 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
                  {productImagesLoading[product._id] !== false && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <Image
                    src={product.picture}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{product.name}</h3>
                
                {product.short_description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {product.short_description}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ${product.price_after.toFixed(2)}
                    </span>
                    {product.price_before > product.price_after && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.price_before.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.categories.slice(0, 2).map(cat => (
                        <span 
                          key={cat} 
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                      {product.categories.length > 2 && (
                        <span className="text-xs text-gray-500">+{product.categories.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {categories.length > 0 ? 'No products found in this category' : 'No products available'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default BusinessPublicProfile;