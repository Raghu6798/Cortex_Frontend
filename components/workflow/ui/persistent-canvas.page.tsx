"use client";

import { usePathname } from "next/navigation";
import { WorkflowCanvas } from "./workflow-canvas";

export function PersistentCanvas() {
  const pathname = usePathname();

  // Show canvas on homepage, workflow pages, and dashboard builder
  const showCanvas = pathname === "/" || pathname.startsWith("/workflows/") || pathname === "/dashboard/builder";

  if (!showCanvas) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0">
      <WorkflowCanvas />
    </div>
  );
}
