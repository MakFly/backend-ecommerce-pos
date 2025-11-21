import { nanoid } from 'nanoid';

/**
 * Base Domain Event
 * Represents something that happened in the domain
 */
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly aggregateId: string;
  public abstract readonly eventType: string;

  constructor(aggregateId: string) {
    this.eventId = nanoid();
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
  }

  abstract toPayload(): Record<string, unknown>;
}
