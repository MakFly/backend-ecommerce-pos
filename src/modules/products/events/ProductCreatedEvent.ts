import { DomainEvent } from '@core/domain/DomainEvent.js';

export class ProductCreatedEvent extends DomainEvent {
  public readonly eventType = 'product.created';

  constructor(
    aggregateId: string,
    private readonly data: {
      handle: string;
      title: string;
      description?: string;
      status: string;
      vendor?: string;
      productType?: string;
    }
  ) {
    super(aggregateId);
  }

  toPayload(): Record<string, unknown> {
    return {
      productId: this.aggregateId,
      ...this.data,
    };
  }
}
