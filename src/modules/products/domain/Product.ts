import { AggregateRoot } from '@core/domain/AggregateRoot.js';
import { ProductCreatedEvent } from '../events/ProductCreatedEvent.js';
import { ProductUpdatedEvent } from '../events/ProductUpdatedEvent.js';
import { Variant } from './Variant.js';

export type ProductStatus = 'draft' | 'active' | 'archived';

interface ProductProps {
  handle: string;
  title: string;
  description?: string;
  status: ProductStatus;
  vendor?: string;
  productType?: string;
  metadata?: Record<string, unknown>;
  variants: Variant[];
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
}

export class Product extends AggregateRoot<ProductProps> {
  private constructor(
    private props: ProductProps,
    id?: string
  ) {
    super(props, id);
  }

  static create(props: Omit<ProductProps, 'variants' | 'images'>): Product {
    const product = new Product({
      ...props,
      variants: [],
      images: [],
    });

    product.addDomainEvent(new ProductCreatedEvent(product.id, props));
    return product;
  }

  static reconstitute(props: ProductProps, id: string): Product {
    return new Product(props, id);
  }

  get handle(): string {
    return this.props.handle;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get vendor(): string | undefined {
    return this.props.vendor;
  }

  get productType(): string | undefined {
    return this.props.productType;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  get variants(): ReadonlyArray<Variant> {
    return this.props.variants;
  }

  get images(): ReadonlyArray<ProductImage> {
    return this.props.images;
  }

  update(props: Partial<Omit<ProductProps, 'variants' | 'images'>>): void {
    this.props = { ...this.props, ...props };
    this.touch();
    this.addDomainEvent(new ProductUpdatedEvent(this.id, props));
  }

  addVariant(variant: Variant): void {
    this.props.variants.push(variant);
    this.touch();
  }

  removeVariant(variantId: string): void {
    this.props.variants = this.props.variants.filter((v) => v.id !== variantId);
    this.touch();
  }

  addImage(image: ProductImage): void {
    this.props.images.push(image);
    this.touch();
  }

  removeImage(imageId: string): void {
    this.props.images = this.props.images.filter((img) => img.id !== imageId);
    this.touch();
  }

  activate(): void {
    this.props.status = 'active';
    this.touch();
  }

  archive(): void {
    this.props.status = 'archived';
    this.touch();
  }
}
