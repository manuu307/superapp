export interface Product {
  _id: string;
  name: string;
  short_description: string;
  description: string;
  picture: string;
  price_before: number;
  price_after: number;
  categories: string[];
  business: string;
}
