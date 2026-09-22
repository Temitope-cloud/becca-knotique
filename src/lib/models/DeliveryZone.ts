import { Schema, model, models, type Model } from "mongoose";

export interface IDeliveryZone {
  _id: string;
  name: string;
  states: string[];
  cities: string[];
  fee: number;
  eta: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    states: { type: [String], default: [] },
    cities: { type: [String], default: [] },
    fee: { type: Number, required: true, min: 0 },
    eta: { type: String, default: "", maxlength: 80 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const DeliveryZone: Model<IDeliveryZone> =
  (models.DeliveryZone as Model<IDeliveryZone>) ||
  model<IDeliveryZone>("DeliveryZone", DeliveryZoneSchema);
