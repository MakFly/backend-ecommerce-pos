/**
 * Event Bus Interface
 *
 * SOLID Principles:
 * - Open/Closed Principle (OCP): Extensible via new event types
 * - Dependency Inversion Principle (DIP): Abstract event infrastructure
 */
export interface IEventBus {
  publish(topic: string, event: Event): Promise<void>;
  subscribe(topic: string, handler: EventHandler): Promise<void>;
  close(): Promise<void>;
}

export interface Event {
  id: string;
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export type EventHandler = (event: Event) => Promise<void>;
