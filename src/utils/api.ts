import { Product } from '../data/mockData';
import { AppConfig } from '../config/appConfig';

/**
 * Ensures any image URL (e.g. from backend DB or user uploads) uses HTTPS and handles relative paths.
 */
export function formatImageUrl(url?: string | null): string {
  if (!url) return '';
  let result = url.trim();
  if (result.startsWith('http://')) {
    result = result.replace('http://', 'https://');
  } else if (result.startsWith('/uploads')) {
    result = `${AppConfig.UPLOADS_URL.replace(/\/uploads$/, '')}${result}`;
  }
  return result;
}

/**
 * Maps the .NET ProductResponseDto to the frontend's expected Product schema.
 */
export function mapApiProductToFrontend(p: any): Product {
  const price = p.discountPrice 
    ? Math.min(Number(p.price), Number(p.discountPrice)) 
    : Number(p.price);
  const originalPrice = p.discountPrice 
    ? Math.max(Number(p.price), Number(p.discountPrice)) 
    : undefined;

  const rawImage = p.imageUrl || 'https://picsum.photos/seed/gift/400/400';
  const image = formatImageUrl(rawImage);

  return {
    id: String(p.id),
    name: p.name,
    price: price,
    originalPrice: originalPrice,
    image: image,
    category: (p.categoryName || 'Personalized Mugs').trim(),
    description: p.description || '',
    rating: Number((4.4 + (p.id % 7) * 0.1).toFixed(1)), // mock realistic ratings: 4.4 - 5.0
    reviews: 12 + (p.id * 19) % 250, // mock realistic review counts
    isTrending: p.price < 2000 || !!p.discountPrice,
    isOffer: !!p.discountPrice,
    stock: Number(p.stock !== undefined && p.stock !== null ? p.stock : 100),
    personalizationType: p.isCustomizable 
      ? (p.id % 2 === 0 ? 'photo' : 'both')
      : 'none',
    hasCustomization: !!p.isCustomizable,
    customizationAvailable: !!p.isCustomizable,
    allowCustomImage: !!p.isCustomizable,
    occasions: p.id % 3 === 0 
      ? ['Birthday', 'Anniversary'] 
      : (p.id % 3 === 1 ? ['Valentine\'s Day', 'Anniversary'] : ['Birthday', 'Wedding'])
  };
}
