export type PaymentIntent = {
  configured: boolean;
  provider: string;
  message: string;
  clientPayload?: Record<string, never>;
};

export interface PaymentProvider {
  id: string;
  createIntent(amountPaise: number, currency: string): Promise<PaymentIntent>;
  verifyWebhook(rawBody: string, signature: string | null): Promise<boolean>;
}

export class CodProvider implements PaymentProvider {
  id = "cod";
  async createIntent(amountPaise: number, currency: string): Promise<PaymentIntent> {
    void amountPaise;
    void currency;
    return {
      configured: true,
      provider: "cod",
      message: "Cash on delivery. Payment is collected at the door. The order is not marked paid until delivery is confirmed.",
    };
  }
  async verifyWebhook(rawBody: string, signature: string | null): Promise<boolean> {
    void rawBody;
    void signature;
    return false;
  }
}

export class RazorpayProvider implements PaymentProvider {
  id = "razorpay";
  async createIntent(amountPaise: number, currency: string): Promise<PaymentIntent> {
    void amountPaise;
    void currency;
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) {
      return {
        configured: false,
        provider: "razorpay",
        message:
          "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the server environment to accept UPI, cards, net banking, and wallets.",
      };
    }
    return {
      configured: true,
      provider: "razorpay",
      message: "Razorpay keys are present. Connect the checkout widget in a follow-up integration step.",
    };
  }
  async verifyWebhook(rawBody: string, signature: string | null): Promise<boolean> {
    void rawBody;
    void signature;
    return false;
  }
}

export const paymentProviders = {
  cod: new CodProvider(),
  razorpay: new RazorpayProvider(),
};
