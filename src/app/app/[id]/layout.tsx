import { ReactNode } from "react";

export default function AppViewerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  );
}
