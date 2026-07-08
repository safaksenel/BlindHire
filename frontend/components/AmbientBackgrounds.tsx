"use client";

import { usePathname } from "next/navigation";
import { BackgroundBloom } from "./BackgroundBloom";
import { DustParticles } from "./DustParticles";

export function AmbientBackgrounds() {
  const pathname = usePathname();
  
  // Disable ambient effects on data-heavy panels or strictly clean panels
  const isDashboard = pathname?.startsWith('/hr') || pathname?.startsWith('/admin') || pathname?.startsWith('/user/profile');

  if (isDashboard) {
    return null;
  }

  return (
    <>
      <BackgroundBloom />
      <DustParticles />
    </>
  );
}
