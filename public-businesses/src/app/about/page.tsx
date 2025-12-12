"use client";

import { useBusiness } from '@/context/BusinessContext';

const AboutPage = () => {
  const { businessData, loading, error } = useBusiness();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!businessData) return <div>Business not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">{businessData.name}</h1>
      {businessData.bannerMedia && <img src={businessData.bannerMedia} alt={`${businessData.name} banner`} className="w-full h-64 object-cover my-4" />}
      {businessData.aboutUs && <p>{businessData.aboutUs}</p>}
    </div>
  );
};

export default AboutPage;