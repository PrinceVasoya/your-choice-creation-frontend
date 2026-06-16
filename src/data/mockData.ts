export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  isTrending?: boolean;
  isOffer?: boolean;
  personalizationType?: 'none' | 'photo' | 'text' | 'both';
  occasions?: string[];
  hasCustomization?: boolean;
  customizationAvailable?: boolean;
  allowCustomImage?: boolean;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Personalized Mugs', image: 'https://images.unsplash.com/photo-1517254456776-9bb245d2b843?auto=format&fit=crop&w=400&h=400&q=80', count: 120 },
  { id: '2', name: 'Custom Cushions', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&h=400&q=80', count: 85 },
  { id: '3', name: 'Photo Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&h=400&q=80', count: 210 },
  { id: '4', name: 'Flower Bouquets', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&h=400&q=80', count: 150 },
  { id: '5', name: 'Unique Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&h=400&q=80', count: 65 },
  { id: '6', name: 'Personalized Frames', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&h=400&q=80', count: 95 },
  { id: '7', name: 'Personalized Wallets', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&h=400&q=80', count: 45 },
];

export const OCCASIONS = [
  { name: 'Birthday', image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Anniversary', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Valentine\'s Day', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Mother\'s Day', image: 'https://images.unsplash.com/photo-1525281260342-7128cb0f750b?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Wedding', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&h=400&q=80' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Magic Color Changing Mug',
    price: 399,
    originalPrice: 599,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Personalized Mugs',
    description: 'Add your favorite photo. The photo appears when hot liquid is poured into the mug. High-quality ceramic with heat-sensitive coating.',
    rating: 4.8,
    reviews: 124,
    isTrending: true,
    isOffer: true,
    personalizationType: 'photo',
    occasions: ['Birthday', 'Mother\'s Day'],
    stock: 15
  },
  {
    id: 'p2',
    name: 'Soft Personalized Cushion',
    price: 499,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Custom Cushions',
    description: 'Beautifully printed soft cushion with your precious memories. Perfect for sofa or bed decor.',
    rating: 4.5,
    reviews: 89,
    isTrending: true,
    personalizationType: 'both',
    occasions: ['Anniversary', 'Wedding'],
    stock: 15
  },
  {
    id: 'p3',
    name: 'Heart Shaped Red Velvet Cake',
    price: 799,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Photo Cakes',
    description: 'Delicious Red Velvet cake in heart shape, perfect for anniversaries. Eggless option available.',
    rating: 4.9,
    reviews: 312,
    isTrending: true,
    isOffer: true,
    personalizationType: 'text',
    occasions: ['Anniversary', 'Valentine\'s Day'],
    stock: 15
  },
  {
    id: 'p4',
    name: 'Royal Rose & Lily Bouquet',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1561101210-af96fd792040?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Flower Bouquets',
    description: 'A premium mix of red roses and white lilies wrapped elegantly. Comes with a personalized card.',
    rating: 4.7,
    reviews: 56,
    personalizationType: 'text',
    occasions: ['Birthday', 'Anniversary'],
    stock: 15
  },
  {
    id: 'p5',
    name: 'Initial Engraved Gold Pendant',
    price: 2499,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Unique Jewelry',
    description: 'Dainty gold pendant engraved with your initial. 18k gold plated. Includes adjustable chain.',
    rating: 4.6,
    reviews: 42,
    isOffer: true,
    personalizationType: 'text',
    occasions: ['Birthday', 'Anniversary'],
    stock: 15
  },
  {
    id: 'p6',
    name: 'Rotating Photo Lamp',
    price: 1599,
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Personalized Frames',
    description: 'A glowing lamp that rotates and showcases your favorite 4 photos. USB powered with LED lights.',
    rating: 4.8,
    reviews: 156,
    isTrending: true,
    personalizationType: 'photo',
    occasions: ['Anniversary', 'Birthday'],
    stock: 15
  },
  {
    id: 'p7',
    name: 'Personalized Wooden Plaque',
    price: 899,
    image: 'https://images.unsplash.com/photo-1544450173-8c8728a13c90?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Personalized Frames',
    description: 'Laser engraved wooden plaque with your favorite quote or image. Sustainable pine wood.',
    rating: 4.7,
    reviews: 34,
    personalizationType: 'both',
    occasions: ['Farewell', 'Birthday'],
    stock: 15
  },
  {
    id: 'p8',
    name: 'Custom Couple Keychain',
    price: 249,
    image: 'https://images.unsplash.com/photo-1622560853942-64b21c56ac11?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Unique Jewelry',
    description: 'A pair of interlocking keychains with engraved names. Zinc alloy material.',
    rating: 4.4,
    reviews: 215,
    personalizationType: 'text',
    occasions: ['Valentine\'s Day', 'Anniversary'],
    stock: 15
  },
  {
    id: 'p9',
    name: 'Handcrafted Personalized Leather Wallet',
    price: 1299,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Personalized Wallets',
    description: 'Premium vegan leather wallet with dual-compartment for cards and cash. Name engraving available on the bottom right corner.',
    rating: 4.9,
    reviews: 87,
    isTrending: true,
    personalizationType: 'text',
    occasions: ['Birthday', 'Anniversary'],
    stock: 15
  }
];
