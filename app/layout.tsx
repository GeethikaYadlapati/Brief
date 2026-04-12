import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { auth } from "@clerk/nextjs/server";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {userId ? (
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flex: 1, background: 'white' }}>
                {children}
              </main>
            </div>
          ) : (
            <>{children}</>
          )}
        </ClerkProvider>
      </body>
    </html>
  );
}