import type { Request, RequestHandler, Response } from 'express';

import { cancelCustomerOrder, getCustomerOrderById, listCustomerOrders } from '../services/order.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { CustomerOrderIdParams, ListCustomerOrdersQuery } from '../validations/order.validation.js';

export const listMyOrdersHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const query = req.query as unknown as ListCustomerOrdersQuery;
    const result = await listCustomerOrders(authUser.id, {
      status: query.status,
      paymentStatus: query.paymentStatus,
      page: query.page,
      limit: query.limit,
    });
    res.json({ success: true, data: result });
  },
);

export const getMyOrderByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const { id } = req.params as unknown as CustomerOrderIdParams;
    const order = await getCustomerOrderById(authUser.id, id);
    res.json({ success: true, data: { order } });
  },
);

export const cancelMyOrderHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const { id } = req.params as unknown as CustomerOrderIdParams;
    const order = await cancelCustomerOrder(authUser.id, id);
    res.json({ success: true, data: { order } });
  },
);