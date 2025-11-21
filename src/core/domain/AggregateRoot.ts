import { Entity } from './Entity.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Aggregate Root - Entity that acts as a consistency boundary
 * All operations on child entities go through the aggregate root
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
