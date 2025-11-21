import { DomainEvent } from '@core/domain/DomainEvent.js';

export class ProductUpdatedEvent extends DomainEvent {
  public readonly eventType = 'product.updated';

  constructor(
    aggregateId: string,
    private readonly changes: Record<string, unknown>
  ) {
    super(aggregateId);
  }

  toPayload(): Record<string, unknown> {
    return {
      productId: this.aggregateId,
      changes: this.changes,
    };
  }
}
