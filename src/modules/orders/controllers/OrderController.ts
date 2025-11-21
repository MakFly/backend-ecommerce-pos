import { Context } from 'hono';
import { OrderService } from '../services/OrderService.js';
import { IController, ApiResponse } from '@shared/interfaces/IController.js';
import { Order } from '../models/Order.js';

export class OrderController implements IController {
  constructor(private readonly service: OrderService) {}

  async list(c: Context): Promise<Response> {
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined;

    const orders = await this.service.listOrders({ limit, offset });

    const response: ApiResponse<Order[]> = {
      data: orders,
      meta: { count: orders.length },
    };

    return c.json(response);
  }

  async get(c: Context): Promise<Response> {
    const id = c.req.param('id');
    const order = await this.service.getOrder(id);

    const response: ApiResponse<Order> = { data: order };
    return c.json(response);
  }

  async create(c: Context): Promise<Response> {
    const dto = await c.req.json();
    const order = await this.service.createOrder(dto);

    const response: ApiResponse<Order> = { data: order };
    return c.json(response, 201);
  }

  async update(c: Context): Promise<Response> {
    const id = c.req.param('id');
    const dto = await c.req.json();
    const order = await this.service.updateOrder(id, dto);

    const response: ApiResponse<Order> = { data: order };
    return c.json(response);
  }

  async cancel(c: Context): Promise<Response> {
    const id = c.req.param('id');
    const order = await this.service.cancelOrder(id);

    const response: ApiResponse<Order> = { data: order };
    return c.json(response);
  }

  async markPaid(c: Context): Promise<Response> {
    const id = c.req.param('id');
    const order = await this.service.markAsPaid(id);

    const response: ApiResponse<Order> = { data: order };
    return c.json(response);
  }

  async markFulfilled(c: Context): Promise<Response> {
    const id = c.req.param('id');
    const order = await this.service.markAsFulfilled(id);

    const response: ApiResponse<Order> = { data: order };
    return c.json(response);
  }
}
