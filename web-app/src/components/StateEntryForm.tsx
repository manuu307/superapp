"use client";
import React, { useState, useContext, useRef } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';

const COLORS = [
  { name: 'red', label: 'Anger/Frustration', color: '#EF4444' },
  { name: 'blue', label: 'Sadness/Low', color: '#3B82F6' },
  { name: 'yellow', label: 'Joy/Energy', color: '#F59E0B' },
  { name: 'green', label: 'Calm/Balance', color: '#10B981' },
  { name: 'purple', label: 'Creativity/Reflection', color: '#8B5CF6' },
  { name: 'black', label: 'Exhaustion/Overload', color: '#000000' },
  { name: 'white', label: 'Neutral/Empty', color: '#FFFFFF' },
];

const TAGS = [
  'angriness', 'sadness', 'sickness', 'creativity', 'motivation',
  'energy', 'anxiety', 'calm', 'focus', 'confusion'
];

const StateEntryForm = () => {
  const { token } = useContext(AuthContext) as AuthContextType;
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [polarity, setPolarity] = useState<'+' | '-' | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size cannot exceed 10MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Invalid file type. Only images and GIFs are allowed.');
        return;
      }

      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedColor) {
      setError('Please select a color.');
      return;
    }
    if (!polarity) {
      setError('Please select a polarity.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('color', selectedColor);
      formData.append('polarity', polarity);
      formData.append('tags', selectedTags.join(','));
      formData.append('description', description);
      formData.append('visibility', visibility);
      if (media) {
        formData.append('media', media);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/me/state`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || ''
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || 'Failed to save state.');
      }

      setSuccess('State saved successfully!');
      // Reset form
      setSelectedColor('');
      setPolarity('');
      setSelectedTags([]);
      setDescription('');
      setVisibility('private');
      removeMedia();

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="p-4 space-y-4 rounded-lg shadow-md">
      <h1 className="text-xl font-bold">How are you feeling right now?</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div>
          <label className="block mb-2 font-bold">1. Define the Polarity:</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPolarity('+')}
              className={`px-4 py-2 rounded-md text-lg font-bold ${polarity === '+' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setPolarity('-')}
              className={`px-4 py-2 rounded-md text-lg font-bold ${polarity === '-' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              -
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-bold">2. Select a color that represents your state:</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(({ name, label, color }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedColor(name)}
                className={`w-12 h-12 rounded-full border-4 ${selectedColor === name ? 'border-blue-500' : 'border-transparent'}`}
                style={{ backgroundColor: color, color: name === 'white' ? 'black' : 'white' }}
                // title={label}
              >
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block mb-2 font-bold">3. Add some tags (optional):</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-bold">4. Add a description (optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="media" className="block mb-2 font-bold">5. Add a Picture (optional):</label>
          <input
            id="media"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,image/gif"
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          {mediaPreview && (
            <div className="mt-4">
              <img src={mediaPreview} alt="Media preview" className="max-w-xs max-h-48 rounded" />
              <button
                type="button"
                onClick={removeMedia}
                className="mt-2 px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="visibility" className="block mb-2 font-bold">6. Visibility:</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'private' | 'shared' | 'public')}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="private">Private</option>
            <option value="shared">Shared</option>
            <option value="public">Public</option>
          </select>
        </div>

        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">
          Save State
        </button>
      </form>
    </div>
  );
};

export default StateEntryForm;