import { connect, NatsConnection, StringCodec, Subscription } from 'nats';
import { DomainEvent } from '../domain/DomainEvent.js';

export type EventHandler = (event: DomainEvent) => Promise<void>;

class EventBus {
  private connection: NatsConnection | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private codec = StringCodec();

  async connect(url: string): Promise<void> {
    if (this.connection) return;

    this.connection = await connect({ servers: url });
    console.log('EventBus connected to NATS');
  }

  async publish(topic: string, event: DomainEvent): Promise<void> {
    if (!this.connection) {
      throw new Error('EventBus not connected');
    }

    const payload = JSON.stringify({
      eventId: event.eventId,
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      occurredAt: event.occurredAt.toISOString(),
      data: event.toPayload(),
    });

    this.connection.publish(topic, this.codec.encode(payload));
  }

  async subscribe(topic: string, handler: EventHandler): Promise<void> {
    if (!this.connection) {
      throw new Error('EventBus not connected');
    }

    if (this.subscriptions.has(topic)) {
      console.warn(`Already subscribed to topic: ${topic}`);
      return;
    }

    const subscription = this.connection.subscribe(topic);
    this.subscriptions.set(topic, subscription);

    (async () => {
      for await (const message of subscription) {
        try {
          const payload = JSON.parse(this.codec.decode(message.data));
          await handler(payload as DomainEvent);
        } catch (error) {
          console.error(`Error handling event on topic ${topic}:`, error);
        }
      }
    })();
  }

  async close(): Promise<void> {
    for (const subscription of this.subscriptions.values()) {
      await subscription.drain();
    }
    this.subscriptions.clear();

    if (this.connection) {
      await this.connection.drain();
      this.connection = null;
    }
  }
}

export const eventBus = new EventBus();
