import { ReactNode } from "react";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    manifest: `/app/${id}/manifest.json`,
    themeColor: "#000000",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "App",
    },
  };
}

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
