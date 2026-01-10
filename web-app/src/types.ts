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
