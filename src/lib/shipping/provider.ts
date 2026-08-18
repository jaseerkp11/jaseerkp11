export type ShippingQuote = {
  method: string;
  label: string;
  amountPaise: number;
  etaDaysMin: number;
  etaDaysMax: number;
  available: boolean;
  message?: string;
};

export interface ShippingProvider {
  quote(pincode: string): Promise<ShippingQuote[]>;
  track(trackingNumber: string): Promise<{ configured: boolean; message: string }>;
}

const METRO = new Set([
  "110001",
  "400001",
  "560001",
  "600001",
  "700001",
  "500001",
  "380001",
  "411001",
]);

export class TableShippingProvider implements ShippingProvider {
  async quote(pincode: string): Promise<ShippingQuote[]> {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return [
        {
          method: "standard",
          label: "Standard",
          amountPaise: 0,
          etaDaysMin: 0,
          etaDaysMax: 0,
          available: false,
          message: "Enter a valid 6-digit pincode",
        },
      ];
    }
    const { getStoreSettings, shippingFeesPaise } = await import("@/lib/services/store-settings");
    const fees = shippingFeesPaise(await getStoreSettings());
    const metro = METRO.has(pincode);
    const expressPaise = metro ? Math.max(0, fees.expressPaise - 5000) : fees.expressPaise;
    return [
      {
        method: "standard",
        label: metro ? "Standard — metro" : "Standard",
        amountPaise: fees.standardPaise,
        etaDaysMin: metro ? 2 : 4,
        etaDaysMax: metro ? 4 : 8,
        available: true,
      },
      {
        method: "express",
        label: "Express",
        amountPaise: expressPaise,
        etaDaysMin: 1,
        etaDaysMax: metro ? 2 : 3,
        available: true,
      },
    ];
  }

  async track(trackingNumber: string) {
    if (!trackingNumber) {
      return { configured: false, message: "No tracking number has been assigned yet." };
    }
    return {
      configured: false,
      message:
        "A carrier integration such as Shiprocket or Delhivery is not configured. Tracking numbers are stored but live tracking is unavailable.",
    };
  }
}

export const shippingProvider: ShippingProvider = new TableShippingProvider();
