"use client";

import { useBusiness } from '@/context/BusinessContext';
import Image from 'next/image';

const AboutPage = () => {
  const { businessData, loading, error } = useBusiness();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!businessData || !businessData.business) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Business not found
        </div>
      </div>
    );
  }

  const { business } = businessData;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Business Name Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          {business.name}
        </h1>
        {business.deliveryAvailable && (
          <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-4 py-1 rounded-full">
            🚚 Delivery Available
          </span>
        )}
      </div>

      {/* Banner Image */}
      {business.bannerMedia && (
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg mb-8">
          <Image
            src={business.bannerMedia}
            alt={`${business.name} banner`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* About Us Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center mb-6">
          {business.picture && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden mr-4 border-4 border-white dark:border-gray-800 shadow-md">
              <Image
                src={business.picture}
                alt={business.name}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            About Us
          </h2>
        </div>

        {business.aboutUs ? (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {business.aboutUs}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No description available yet.
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Check back soon for more information about {business.name}.
            </p>
          </div>
        )}

        {/* Additional Business Details */}
        {(business.location || business.openDaysHours) && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Business Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              {business.location && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <h4 className="font-medium text-gray-800 dark:text-white">Location</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{business.location.address}</p>
                </div>
              )}

              {/* Operating Hours */}
              {business.openDaysHours && business.openDaysHours.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <h4 className="font-medium text-gray-800 dark:text-white">Operating Hours</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Open {business.openDaysHours.length} days a week
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to learn more about {business.name}?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
            >
              Contact Us
            </a>
            <a 
              href="/products" 
              className="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 px-6 rounded-lg transition duration-300"
            >
              View Products
            </a>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AboutPage;