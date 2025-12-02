"use client";

import Image from "next/image";
import { SiteShell } from "../../components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";

export default function AboutPage() {
  const { lang } = useLanguage();

  return (
    <SiteShell>
      <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
        {/* Hero Section */}
        <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop"
              alt="Office"
              fill
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900">
                📦｜MBPACK.CO
                <span className="block mt-2 text-2xl md:text-4xl font-light text-zinc-600">
                  {lang === "zh" ? "新世代企業級包裝生產中心" : "Enterprise Packaging Production Center"}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 font-light tracking-wide">
                {lang === "zh" ? "Enterprise Packaging Production Center for Global Brands" : "for Global Brands"}
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6 pt-8 border-t border-zinc-200">
              {lang === "zh" ? (
                <p className="text-lg md:text-xl leading-relaxed text-zinc-800 font-medium">
                  由清晨沙灘（MorningBeach）15 年經驗打造，
                  <br className="hidden md:block" />
                  MBPACK.CO 以 AI-First 的模式整合
                  <br className="hidden md:block" />
                  台灣專案團隊 + 深圳／溫州工廠網路，
                  <br className="hidden md:block" />
                  為跨國品牌提供更高效率、更穩定的大貨生產服務。
                </p>
              ) : (
                <p className="text-lg md:text-xl leading-relaxed text-zinc-800 font-medium">
                  Built upon 15 years of production experience,
                  <br className="hidden md:block" />
                  MBPACK.CO integrates an AI-First workflow with
                  <br className="hidden md:block" />
                  Taiwan project management + Shenzhen/Wenzhou manufacturing,
                  <br className="hidden md:block" />
                  delivering reliable, enterprise-grade packaging solutions for global brands.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Feature 01 */}
        <section className="py-24 md:py-32 px-6 bg-zinc-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 space-y-8">
              <div className="space-y-2">
                <span className="text-zinc-400 font-mono text-sm tracking-wider">FEATURE 01</span>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
                  {lang === "zh" ? "AI-Enhanced Decision Making" : "AI-Enhanced Decision Making"}
                </h2>
              </div>
              
              <div className="space-y-6">
                {lang === "zh" ? (
                  <p className="text-lg md:text-xl text-zinc-800 leading-relaxed">
                    從結構設計、材質配置、成本級距，到打樣排程，
                    AI 協助我們在短時間內生成可行方案，
                    讓企業專案更快進入生產階段。
                  </p>
                ) : (
                  <p className="text-lg md:text-xl text-zinc-800 leading-relaxed">
                    From structural design and material planning
                    to cost modeling and sampling schedules,
                    AI accelerates early-stage decisions—
                    helping enterprise projects move forward faster and more precisely.
                  </p>
                )}
              </div>
            </div>
            <div className="order-1 md:order-2 relative h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop"
                alt="AI Technology"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* Feature 02 */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
                alt="Factory Production"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-zinc-400 font-mono text-sm tracking-wider">FEATURE 02</span>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
                  {lang === "zh" ? "跨區工廠整合，專為大貨交付而生" : "Global Production Integration"}
                </h2>
              </div>
              
              <div className="space-y-6">
                {lang === "zh" ? (
                  <p className="text-lg md:text-xl text-zinc-800 leading-relaxed">
                    台灣負責溝通與控管，
                    深圳／溫州負責大貨生產、物料管理與 QC。
                    我們的流程專為 跨國交付與規模化需求 設計。
                  </p>
                ) : (
                  <p className="text-lg md:text-xl text-zinc-800 leading-relaxed">
                    Taiwan manages communication and quality control,
                    while Shenzhen/Wenzhou handle mass production and materials.
                    Our workflow is designed specifically for international delivery and large-scale orders.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature 03 */}
        <section className="py-24 md:py-32 px-6 bg-zinc-900 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 space-y-8">
              <div className="space-y-2">
                <span className="text-zinc-500 font-mono text-sm tracking-wider">FEATURE 03</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {lang === "zh" ? "完整包裝體系，一個窗口全包辦" : "Integrated Packaging System"}
                </h2>
              </div>
              
              <div className="space-y-6">
                {lang === "zh" ? (
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
                    紙盒、禮盒、提袋、企業禮、週邊商品……
                    以印刷＋紡織＋禮品三端整合，
                    協助企業提升全球市場競爭力。
                  </p>
                ) : (
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
                    From boxes, gift sets, and bags
                    to corporate gifts and branded merchandise—
                    our integrated printing, textile, and gifting capabilities
                    enhance your brand’s global competitiveness.
                  </p>
                )}
              </div>
            </div>
            <div className="order-1 md:order-2 relative h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
              <Image
                src="https://images.unsplash.com/photo-1631624215749-b10b3dd7bca7?q=80&w=1974&auto=format&fit=crop"
                alt="Packaging Products"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-white text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 tracking-tight">
                {lang === "zh" ? (
                  <>
                    🚀 讓包裝，不再拖慢專案，
                    <br />
                    而是推動企業前進。
                  </>
                ) : (
                  <>
                    Let packaging become a driver—
                    <br />
                    not a bottleneck.
                  </>
                )}
              </h2>
              <p className="text-xl md:text-2xl text-zinc-500 font-light">
                {lang === "zh" ? "Let packaging become a driver—not a bottleneck." : ""}
              </p>
            </div>

            <div className="space-y-8 pt-8">
              <div className="space-y-4">
                <p className="text-xl text-zinc-800 font-medium">
                  {lang === "zh" ? "MBPACK.CO 誠摯邀請成長型企業與跨國品牌合作。" : "MBPACK.CO welcomes collaboration with growing enterprises and global brands."}
                </p>
                <p className="text-lg text-zinc-500 font-light">
                  {lang === "zh" ? "MBPACK.CO welcomes collaboration with growing enterprises and global brands." : ""}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
                <a 
                  href="/" 
                  className="px-8 py-4 bg-zinc-900 text-white rounded-full text-lg font-medium hover:bg-zinc-800 transition-colors"
                >
                  👉 mbpack.co
                </a>
                <a 
                  href="/contact" 
                  className="px-8 py-4 border border-zinc-200 text-zinc-900 rounded-full text-lg font-medium hover:bg-zinc-50 transition-colors"
                >
                  👉 Welcome to contact us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
