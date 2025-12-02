import { SiteShell } from "@/components/SiteShell";
import HeroTestClient from "./HeroTestClient";

export const dynamic = "force-dynamic";

export default function TestHeroPage() {
  return (
    <SiteShell>
      <div className="py-10">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Hero Section Design Variations</h1>
          <p className="text-zinc-500">Comparing different layouts for the homepage hero section.</p>
        </div>
        <HeroTestClient />
      </div>
    </SiteShell>
  );
}
