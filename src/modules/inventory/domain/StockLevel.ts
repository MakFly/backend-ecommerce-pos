import { Entity } from '@core/domain/Entity.js';

interface StockLevelProps {
  variantId: string;
  warehouseId: string;
  available: number;
  reserved: number;
  incoming: number;
}

export class StockLevel extends Entity<StockLevelProps> {
  private constructor(private props: StockLevelProps, id?: string) {
    super(props, id);
  }

  static create(props: StockLevelProps): StockLevel {
    return new StockLevel(props);
  }

  static reconstitute(props: StockLevelProps, id: string): StockLevel {
    return new StockLevel(props, id);
  }

  get variantId(): string {
    return this.props.variantId;
  }

  get warehouseId(): string {
    return this.props.warehouseId;
  }

  get available(): number {
    return this.props.available;
  }

  get reserved(): number {
    return this.props.reserved;
  }

  get total(): number {
    return this.props.available + this.props.reserved;
  }

  reserve(quantity: number): void {
    if (quantity > this.props.available) {
      throw new Error('Insufficient stock');
    }
    this.props.available -= quantity;
    this.props.reserved += quantity;
    this.touch();
  }

  release(quantity: number): void {
    if (quantity > this.props.reserved) {
      throw new Error('Invalid release quantity');
    }
    this.props.reserved -= quantity;
    this.props.available += quantity;
    this.touch();
  }

  adjust(quantity: number): void {
    this.props.available = quantity;
    this.touch();
  }
}
