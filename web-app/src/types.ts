export interface Track {
  _id: string;
  title: string;
  authorId: {
    username: string;
    profilePicture: string;
  };
  priceEnergy: number;
  duration: number;
  minioObjectKey: string;
  previewObjectKey?: string;
  createdAt: string;
  isPublic: boolean;
}

export interface UserState {
  _id: string;
  user?: {
    _id?: string;
    name: string;
  };
  color: 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'black' | 'white';
  polarity: '+' | '-';
  tags?: string[];
  description?: string;
  visibility: 'private' | 'shared' | 'public';
  sharedWith?: string[];
  media?: {
    type: 'image' | 'gif';
    url: string;
  };
  createdAt: string;
}