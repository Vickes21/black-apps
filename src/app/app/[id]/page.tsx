import { notFound } from "next/navigation";
import { AppIframeViewer } from "@/components/app-iframe-viewer";
import { db } from "@/lib/drizzle";
import { apps, TApp } from "@/lib/drizzle/schemas";
import { eq } from "drizzle-orm";

export default async function AppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const app = await db.query.apps.findFirst({
    where: eq(apps.id, id),
  });

  if (!app) {
    notFound();
  }

  return <AppIframeViewer app={app} />;
}
