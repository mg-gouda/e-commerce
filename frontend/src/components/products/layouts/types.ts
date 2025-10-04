export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: string | number;
  stock: number;
  category: {
    id: string;
    name: string;
  };
  image_url?: string;
  images?: string[];
  average_rating: string | number;
  sku?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  video_url?: string;
  attributes?: Array<{ name: string; value: string }>;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  title?: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ProductLayoutProps {
  product: Product;
  reviews: Review[];
  quantity: number;
  setQuantity: (quantity: number) => void;
  addingToCart: boolean;
  addToCart: () => void;
  renderStars: (rating: number) => JSX.Element[];
  formatDate: (dateString: string) => string;
}
