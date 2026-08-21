export const metadata = {
  title: "ClaimRadar",
  description: "Public index of crypto signup/in-app rewards and on-chain token earn programs. You sign up yourself.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#07090f",
          color: "#e8edf7",
        }}
      >
        {children}
      </body>
    </html>
  );
}
