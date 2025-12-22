export interface ProductDimensions {
  width: number
  height: number
  depth: number
}

export interface ProductReview {
  rating: number
  comment: string
  date: string // или Date, если будете парсить строку в Date объект
  reviewerName: string
  reviewerEmail: string
}

export interface ProductMeta {
  createdAt: string // или Date
  updatedAt: string // или Date
  barcode: string
  qrCode: string
}

export interface ProductInterface {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand: string
  sku: string
  weight: number
  dimensions: ProductDimensions
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: ProductReview[]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: ProductMeta
  images: string[]
  thumbnail: string
}
