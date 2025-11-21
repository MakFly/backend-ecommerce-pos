import { Context } from 'hono';

/**
 * Base Controller Interface
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Controller handles HTTP only
 * - Dependency Inversion Principle (DIP): Depends on service interface
 */
export interface IController {
  // Marker interface for controllers
}

/**
 * HTTP Response helpers
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Controller method signature
 */
export type ControllerMethod = (c: Context) => Promise<Response>;
