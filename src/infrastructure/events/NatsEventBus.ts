import { connect, NatsConnection, StringCodec } from 'nats';
import { IEventBus, Event, EventHandler } from '@shared/interfaces/IEventBus.js';

/**
 * NATS Event Bus Implementation
 *
 * SOLID Principles:
 * - Single Responsibility: Event publishing/subscribing only
 * - Dependency Inversion: Implements IEventBus interface
 */
export class NatsEventBus implements IEventBus {
  private connection: NatsConnection | null = null;
  private codec = StringCodec();

  async connect(url: string): Promise<void> {
    this.connection = await connect({ servers: url });
    console.log('✅ Event Bus connected to NATS');
  }

  async publish(topic: string, event: Event): Promise<void> {
    if (!this.connection) {
      throw new Error('Event bus not connected');
    }

    const payload = JSON.stringify(event);
    this.connection.publish(topic, this.codec.encode(payload));
  }

  async subscribe(topic: string, handler: EventHandler): Promise<void> {
    if (!this.connection) {
      throw new Error('Event bus not connected');
    }

    const subscription = this.connection.subscribe(topic);

    (async () => {
      for await (const message of subscription) {
        try {
          const payload = JSON.parse(this.codec.decode(message.data));
          await handler(payload);
        } catch (error) {
          console.error(`Error handling event on topic ${topic}:`, error);
        }
      }
    })();
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.drain();
      this.connection = null;
    }
  }
}
