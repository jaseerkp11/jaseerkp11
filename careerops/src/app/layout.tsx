export const metadata = {
  title: "CareerOps — Mohammed Jaseer",
  description: "Match UAE-ready accounting and operations roles, tailor the CV, track applications. You submit forms yourself.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#f4efe4",
          color: "#12232e",
        }}
      >
        {children}
      </body>
    </html>
  );
}
