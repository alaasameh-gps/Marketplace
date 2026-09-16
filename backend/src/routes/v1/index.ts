import { Router } from 'express';

import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import brandRoutes from './brands.routes.js';
import cartRoutes from './cart.routes.js';
import categoriesRoutes from './categories.routes.js';
import checkoutRoutes from './checkout.routes.js';
import ordersRoutes from './orders.routes.js';
import paymentRoutes from './payment.routes.js';
import productsRoutes from './products.routes.js';
import userRoutes from './user.routes.js';
import vendorRoutes from './vendor.routes.js';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoriesRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productsRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);

export default router;