export interface Business {
  _id: string;
  name: string;
  owner: string;
  admins: string[];
  catalog: string[];
  picture?: string;
  bannerMedia?: string;
  aboutUs?: string;
  deliveryAvailable?: boolean;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  subdomain?: string;
  openDaysHours?: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
  createdAt: Date;
}
