import { notFound } from "next/navigation";
import { db } from "@/lib/drizzle";
import { AppIframeViewer } from "@/components/app-iframe-viewer";
import type { Metadata, Viewport } from "next";

interface AppPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getApp(id: string) {
  const app = await db.query.apps.findFirst({
    where: (apps, { eq }) => eq(apps.id, id),
  });
  return app;
}

export async function generateMetadata({
  params,
}: AppPageProps): Promise<Metadata> {

  const paramsValue = await params;
  const app = await getApp(paramsValue.id);

  if (!app) {
    return {
      title: "App não encontrado",
    };
  }

  return {
    title: app.name,
    description: `${app.name} - Black Apps`,
    manifest: `/app/${paramsValue.id}/manifest.json`,
    icons: {
      icon: app.imageUrl,
      apple: app.imageUrl,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: app.name,
    },
  };
}

export async function generateViewport({
  params,
}: AppPageProps): Promise<Viewport> {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#000000",
  };
}

export default async function AppPage({ params }: AppPageProps) {
  const paramsValue = await params;
  const app = await getApp(paramsValue.id);

  if (!app) {
    notFound();
  }

  return <AppIframeViewer app={app} />;
}
