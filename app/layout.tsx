import { ClerkProvider, UserButton, Show } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Show when="signed-out">
            <div className="flex items-center justify-center min-h-screen">
              <SignInButton />
            </div>
          </Show>
          <Show when="signed-in">
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 p-6 bg-white">
                {children}
              </main>
            </div>
          </Show>
        </ClerkProvider>
      </body>
    </html>
  );
}