import type { Request, RequestHandler, Response } from 'express';

import { getOrderById, listOrders, setOrderStatus } from '../../services/order.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { IdParams } from '../../validations/admin/common.js';

export const listOrdersHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listOrders({
      customer: (req.query.customer as string | undefined) ?? undefined,
      vendor: (req.query.vendor as string | undefined) ?? undefined,
      status: (req.query.status as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getOrderByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const order = await getOrderById(id);
    res.json({ success: true, data: { order } });
  },
);

export const setOrderStatusHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const order = await setOrderStatus(id, req.body.status);
    res.json({ success: true, data: { order } });
  },
);