export const metadata = {
  title: "ClaimRadar",
  description: "Fresh scan of new on-chain claim contracts and newly listed apps. You check offers yourself.",
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
