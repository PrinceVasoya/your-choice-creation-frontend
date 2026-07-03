import { Product } from '../data/mockData';
import { AppConfig } from '../config/appConfig';

/**
 * Maps the .NET ProductResponseDto to the frontend's expected Product schema.
 */
export function mapApiProductToFrontend(p: any): Product {
  return {
    id: String(p.id),
    name: p.name,
    price: Number(p.price),
    originalPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
    image: p.imageUrl 
      ? (p.imageUrl.startsWith('/') ? `${AppConfig.API_BASE_URL}${p.imageUrl}` : p.imageUrl)
      : 'https://picsum.photos/seed/gift/400/400',
    category: p.categoryName || 'Personalized Mugs',
    description: p.description || '',
    rating: Number((4.4 + (p.id % 7) * 0.1).toFixed(1)), // mock realistic ratings: 4.4 - 5.0
    reviews: 12 + (p.id * 19) % 250, // mock realistic review counts
    isTrending: p.price < 1500, // automatically trend lower-priced items
    isOffer: !!p.discountPrice,
    stock: Number(p.stock !== undefined && p.stock !== null ? p.stock : 0),
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
