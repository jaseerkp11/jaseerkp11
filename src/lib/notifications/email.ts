export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailProvider {
  configured: boolean;
  send(message: EmailMessage): Promise<{ sent: boolean; reason?: string }>;
}

class ConsoleEmailProvider implements EmailProvider {
  get configured() {
    return Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
  }
  async send(message: EmailMessage) {
    if (!this.configured) {
      return {
        sent: false,
        reason:
          "No email provider is configured. Set SMTP_HOST or RESEND_API_KEY to send mail. The message was not delivered.",
      };
    }
    void message;
    return {
      sent: false,
      reason: "An email provider is configured but the transport adapter is not connected yet.",
    };
  }
}

export const emailProvider: EmailProvider = new ConsoleEmailProvider();

export const notificationTemplates = {
  welcome: (name: string) => ({
    subject: `Welcome`,
    text: `Hello ${name}, your account is ready.`,
  }),
  orderConfirmed: (orderNumber: string) => ({
    subject: `Order ${orderNumber} confirmed`,
    text: `We received order ${orderNumber}.`,
  }),
};
