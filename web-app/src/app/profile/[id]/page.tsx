"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import UserAvatar from '@/components/UserAvatar';

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
  name?: string;
  lastname?: string;
  nickname?: string;
  tags?: string[];
  description?: string;
  website?: string;
}

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/users/${id}`);
          setUser(response.data);
        } catch (err) {
          setError('Failed to fetch user profile.');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  if (loading) return <div className="text-center p-8">Loading profile...</div>;
  if (error) return <div className="text-center p-8 text-red-400">{error}</div>;
  if (!user) return <div className="text-center p-8">User not found.</div>;

  return (
    <div className="bg-slate-900 min-h-screen text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <UserAvatar user={user} size="lg" />
          <div>
            <h1 className="text-4xl font-bold">{user.username}</h1>
            {user.name && user.lastname && <p className="text-slate-400">{user.name} {user.lastname}</p>}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          {user.description && <p className="mb-4">{user.description}</p>}
          {user.website && (
            <p className="mb-4">
              Website: <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{user.website}</a>
            </p>
          )}
          {user.tags && user.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.tags.map(tag => (
                <span key={tag} className="bg-slate-700 px-2 py-1 rounded-full text-sm">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
