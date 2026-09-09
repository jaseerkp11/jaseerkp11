export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailProvider {
  configured: boolean;
  send(message: EmailMessage): Promise<{ sent: boolean; reason?: string }>;
}

class ResendEmailProvider implements EmailProvider {
  get configured() {
    return Boolean(process.env.RESEND_API_KEY);
  }

  async send(message: EmailMessage) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return {
        sent: false,
        reason: "No email provider is configured. Set RESEND_API_KEY to send mail.",
      };
    }
    const from = process.env.EMAIL_FROM?.trim() || "THERAREIFY <beth.t@example.com>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!res.ok) {
      return { sent: false, reason: `Email provider returned ${res.status}.` };
    }
    return { sent: true };
  }
}

export const emailProvider: EmailProvider = new ResendEmailProvider();

export const notificationTemplates = {
  welcome: (name: string) => ({
    subject: `Welcome`,
    text: `Hello ${name}, your account is ready.`,
  }),
  orderConfirmed: (orderNumber: string, totalLabel: string, payment: string) => ({
    subject: `Order ${orderNumber} received`,
    text: `We received order ${orderNumber} for ${totalLabel}. Payment: ${payment}. We will update you when it is packed and shipped.`,
  }),
};
