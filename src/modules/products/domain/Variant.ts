import { Entity } from '@core/domain/Entity.js';
import { Money } from './Money.js';

interface VariantProps {
  productId: string;
  sku: string;
  barcode?: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  costPerItem?: Money;
  taxable: boolean;
  weight?: {
    value: number;
    unit: string;
  };
  requiresShipping: boolean;
  metadata?: Record<string, unknown>;
}

export class Variant extends Entity<VariantProps> {
  private constructor(
    private props: VariantProps,
    id?: string
  ) {
    super(props, id);
  }

  static create(props: VariantProps): Variant {
    return new Variant(props);
  }

  static reconstitute(props: VariantProps, id: string): Variant {
    return new Variant(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get sku(): string {
    return this.props.sku;
  }

  get barcode(): string | undefined {
    return this.props.barcode;
  }

  get title(): string {
    return this.props.title;
  }

  get price(): Money {
    return this.props.price;
  }

  get compareAtPrice(): Money | undefined {
    return this.props.compareAtPrice;
  }

  get costPerItem(): Money | undefined {
    return this.props.costPerItem;
  }

  get taxable(): boolean {
    return this.props.taxable;
  }

  get weight(): { value: number; unit: string } | undefined {
    return this.props.weight;
  }

  get requiresShipping(): boolean {
    return this.props.requiresShipping;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  updatePrice(price: Money): void {
    this.props.price = price;
    this.touch();
  }

  update(props: Partial<VariantProps>): void {
    this.props = { ...this.props, ...props };
    this.touch();
  }
}
