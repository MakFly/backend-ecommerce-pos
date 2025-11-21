/**
 * Dependency Injection Container
 *
 * SOLID Principles:
 * - Dependency Inversion Principle (DIP): Manages dependencies centrally
 * - Single Responsibility Principle (SRP): Container only resolves dependencies
 * - Open/Closed Principle (OCP): Easy to add new services
 */

type Factory<T> = () => T;
type Singleton<T> = { instance: T };

export class Container {
  private factories = new Map<string, Factory<unknown>>();
  private singletons = new Map<string, Singleton<unknown>>();

  /**
   * Register a transient service (new instance each time)
   */
  register<T>(name: string, factory: Factory<T>): void {
    this.factories.set(name, factory);
  }

  /**
   * Register a singleton service (single instance)
   */
  registerSingleton<T>(name: string, factory: Factory<T>): void {
    const instance = factory();
    this.singletons.set(name, { instance });
  }

  /**
   * Resolve a service by name
   */
  resolve<T>(name: string): T {
    // Check singletons first
    const singleton = this.singletons.get(name);
    if (singleton) {
      return singleton.instance as T;
    }

    // Then transient factories
    const factory = this.factories.get(name);
    if (factory) {
      return factory() as T;
    }

    throw new Error(`Service "${name}" not found in container`);
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.factories.has(name) || this.singletons.has(name);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.factories.clear();
    this.singletons.clear();
  }
}

// Global container instance
export const container = new Container();
