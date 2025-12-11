export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  contacts: string[];
  rooms: string[];
  businesses: string[];
  catalog: {
    name: string;
    description: string;
    picture: string;
  }[];
  date: Date;
}
