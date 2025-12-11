"use client";
import { useBusiness } from '../../../../context/BusinessContext';

const AboutPage = () => {
  const { business, loading, error } = useBusiness();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!business) return <div>Business not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">{business.name}</h1>
      {business.bannerMedia && <img src={business.bannerMedia} alt={`${business.name} banner`} className="w-full h-64 object-cover my-4" />}
      {business.aboutUs && <p>{business.aboutUs}</p>}
    </div>
  );
};

export default AboutPage;
