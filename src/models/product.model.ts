import { BaseModel } from '@/models/base-model'
import type { ProductInterface, ProductDimensions, ProductReview, ProductMeta } from '@/core/rest-interface/product'

export class ProductModel extends BaseModel {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly category: string
  readonly price: number
  readonly discountPercentage: number
  readonly rating: number
  readonly stock: number
  readonly tags: string[]
  readonly brand: string
  readonly sku: string
  readonly weight: number
  readonly dimensions: ProductDimensions
  readonly warrantyInformation: string
  readonly shippingInformation: string
  readonly availabilityStatus: string
  readonly reviews: ProductReview[]
  readonly returnPolicy: string
  readonly minimumOrderQuantity: number
  readonly meta: ProductMeta
  readonly images: string[]
  readonly thumbnail: string

  constructor(raw: ProductInterface) {
    super(raw)

    this.id = raw.id
    this.title = raw.title
    this.description = raw.description
    this.category = raw.category
    this.price = raw.price
    this.discountPercentage = raw.discountPercentage
    this.rating = raw.rating
    this.stock = raw.stock
    this.tags = raw.tags
    this.brand = raw.brand
    this.sku = raw.sku
    this.weight = raw.weight
    this.dimensions = raw.dimensions
    this.warrantyInformation = raw.warrantyInformation
    this.shippingInformation = raw.shippingInformation
    this.availabilityStatus = raw.availabilityStatus
    this.reviews = raw.reviews
    this.returnPolicy = raw.returnPolicy
    this.minimumOrderQuantity = raw.minimumOrderQuantity
    this.meta = raw.meta
    this.images = raw.images
    this.thumbnail = raw.thumbnail
  }

  public formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  public getFormattedPrice(): string {
    return this.formatPrice(this.price)
  }

  public getFormattedDiscountedPrice(): string {
    return this.formatPrice(this.DiscountedPrice)
  }

  get Title(): string {
    return this.title
  }

  get Description(): string {
    return this.description
  }

  get Price(): number {
    return this.price
  }

  get DiscountedPrice(): number {
    return this.price * (1 - this.discountPercentage / 100)
  }

  get DiscountPercentage(): number {
    return this.discountPercentage
  }

  get DiscountAmount(): number {
    return this.price * (this.discountPercentage / 100)
  }

  get Rating(): number {
    return this.rating
  }

  get Stock(): number {
    return this.stock
  }

  get IsInStock(): boolean {
    return this.stock > 0 && this.availabilityStatus.toLowerCase().includes('in stock')
  }

  get Brand(): string {
    return this.brand
  }

  get Category(): string {
    return this.category
  }

  get Tags(): string[] {
    return this.tags
  }

  get MainImage(): string {
    return this.images[0] || this.thumbnail
  }

  get ThumbnailImage(): string {
    return this.thumbnail
  }

  get Images(): string[] {
    return this.images
  }

  get Reviews(): ProductReview[] {
    return this.reviews
  }

  get AverageRating(): number {
    if (this.reviews.length === 0) return this.rating

    const sum = this.reviews.reduce((total, review) => total + review.rating, 0)
    return sum / this.reviews.length
  }

  get ReviewCount(): number {
    return this.reviews.length
  }

  get ShippingInfo(): string {
    return this.shippingInformation
  }

  get WarrantyInfo(): string {
    return this.warrantyInformation
  }

  get ReturnPolicy(): string {
    return this.returnPolicy
  }

  get Weight(): number {
    return this.weight
  }

  get Dimensions(): ProductDimensions {
    return this.dimensions
  }

  get Sku(): string {
    return this.sku
  }

  get CreatedAt(): Date {
    return new Date(this.meta.createdAt)
  }

  get UpdatedAt(): Date {
    return new Date(this.meta.updatedAt)
  }

  get Barcode(): string {
    return this.meta.barcode
  }

  get QrCode(): string {
    return this.meta.qrCode
  }

  get FormattedPrice(): string {
    return this.getFormattedPrice()
  }

  get FormattedDiscountedPrice(): string {
    return this.getFormattedDiscountedPrice()
  }

  get RatingStars(): { full: number; half: boolean; empty: number } {
    const fullStars = Math.floor(this.AverageRating)
    const hasHalfStar = this.AverageRating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return {
      full: fullStars,
      half: hasHalfStar,
      empty: emptyStars
    }
  }

  get DimensionsFormatted(): string {
    return `${this.dimensions.width} × ${this.dimensions.height} × ${this.dimensions.depth}`
  }

  get WeightFormatted(): string {
    if (this.weight >= 1000) {
      return `${(this.weight / 1000).toFixed(2)} kg`
    }
    return `${this.weight} g`
  }
}
