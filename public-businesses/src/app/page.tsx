import { headers } from 'next/headers'
import BusinessPublicProfile from '@/components/BusinessPublicProfile';

const BusinessPublicProfilePage = async () => {
    
    const headersList = await headers()
    const businessId = headersList.get('x-business')
    
  return (
    <div>
      <BusinessPublicProfile businessId={businessId as string}/>
    </div>
  );
};

export default BusinessPublicProfilePage;
