export interface Room {
  _id: string;
  name: string;
  users: string[];
  isPublic: boolean;
  createdAt: Date;
}
