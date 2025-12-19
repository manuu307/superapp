"use client";
import { useBusiness } from '@/context/BusinessContext';

const ContactPage = () => {
  const { businessData, loading, error } = useBusiness();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!businessData || !businessData.business) return <div>Business not found</div>;

  const { business } = businessData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      {/* Operating Hours */}
      <div className="my-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Operating Hours</h2>
        {business.openDaysHours && business.openDaysHours.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-gray-800 dark:text-white font-medium">Day</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-gray-800 dark:text-white font-medium">Open</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-gray-800 dark:text-white font-medium">Close</th>
                </tr>
              </thead>
              <tbody>
                {business.openDaysHours.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">{day.dayOfWeek}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">{day.openTime}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">{day.closeTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No operating hours available</p>
        )}
      </div>

      {/* Location */}
      {business.location && (
        <div className="my-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Location</h2>
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              <span className="font-semibold">Address:</span> {business.location.address}
            </p>
            
            {/* Google Maps Embed */}
            <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${business.location.latitude},${business.location.longitude}&zoom=15`}
                title={`${business.name} Location`}
              />
            </div>
            
            {/* Coordinates for reference */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              <p>Coordinates: {business.location.latitude.toFixed(6)}, {business.location.longitude.toFixed(6)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Business Information */}
      <div className="my-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Business Information</h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Name:</span>
            <span className="text-gray-800 dark:text-white">{business.name}</span>
          </div>
          
          {business.aboutUs && (
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">About:</span>
              <span className="text-gray-600 dark:text-gray-300">{business.aboutUs}</span>
            </div>
          )}
          
          {business.deliveryAvailable && (
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Delivery:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Available
              </span>
            </div>
          )}
          
          {/* Contact Information (if available in the future) */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Contact Details</h3>
            <p className="text-gray-600 dark:text-gray-400">
              For inquiries, please visit our store or contact us during business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;