import { InferSchemaType, Schema, model } from 'mongoose';

import { COMMISSION_STATUSES, moneyField } from './shared.js';

export const commissionSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    orderGroupId: { type: Schema.Types.ObjectId, required: true },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    rate: { type: Number, required: true, min: 0, max: 100 },
    amount: { ...moneyField },
    commissionAmount: { ...moneyField },
    vendorEarnings: { ...moneyField },
    status: { type: String, enum: COMMISSION_STATUSES, default: 'pending' },
    settledAt: { type: Date, default: undefined },
    settlementRef: { type: String, trim: true, default: undefined },
  },
  { timestamps: true },
);

commissionSchema.index({ order: 1, orderGroupId: 1 }, { unique: true });
commissionSchema.index({ vendor: 1, status: 1 });
commissionSchema.index({ status: 1 });

export type CommissionDoc = InferSchemaType<typeof commissionSchema>;

export const Commission = model('Commission', commissionSchema);