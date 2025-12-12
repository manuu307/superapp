"use client";
import { useBusiness } from '@/context/BusinessContext';

const ContactPage = () => {
  const { businessData, loading, error } = useBusiness();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!businessData) return <div>Business not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <div className="my-4">
        <h2 className="text-2xl font-bold">Operating Hours</h2>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Day</th>
              <th className="px-4 py-2">Open</th>
              <th className="px-4 py-2">Close</th>
            </tr>
          </thead>
          <tbody>
            {businessData.openDaysHours && businessData.openDaysHours.map((day, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{day.dayOfWeek}</td>
                <td className="border px-4 py-2">{day.openTime}</td>
                <td className="border px-4 py-2">{day.closeTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {businessData.location && (
        <div>
          <h2 className="text-2xl font-bold">Location</h2>
          <p>{businessData.location.address}</p>
          <iframe
            width="600"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${businessData.location.latitude},${businessData.location.longitude}`}>
          </iframe>
        </div>
      )}
    </div>
  );
};

export default ContactPage;