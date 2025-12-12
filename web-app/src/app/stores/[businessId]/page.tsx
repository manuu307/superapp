'use client';

import { useParams } from 'next/navigation';
import BusinessPublicProfile from '@/components/BusinessPublicProfile';

const BusinessPublicProfilePage = () => {
  const { businessId } = useParams();

  return (
    <div>
      <BusinessPublicProfile businessId={businessId as string} />
    </div>
  );
};

export default BusinessPublicProfilePage;
