import NearbyList from '@/components/NearbyList';

const NearbyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Find What's Near You</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
        Discover circles and events happening around you right now.
      </p>
      <NearbyList />
    </div>
  );
};

export default NearbyPage;
