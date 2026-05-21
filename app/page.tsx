import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FoundingMemberBanner from "@/components/sections/FoundingMemberBanner";
import HeroSection from "@/components/sections/HeroSection";
import WhatPegaDoesSection from "@/components/sections/WhatPegaDoesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import PackagesSection from "@/components/sections/PackagesSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import UseCaseSection from "@/components/sections/UseCaseSection";
import TrustSection from "@/components/sections/TrustSection";
import ShowcaseSection from "@/components/sections/ShowcaseSection";
import EducationSection from "@/components/sections/EducationSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";
import CTABannerSection from "@/components/sections/CTABannerSection";
import SessionProvider from "@/components/providers/SessionProvider";

async function getHomeData() {
  const [packages, showcases, educations, testimonials, settingsArr] = await Promise.all([
    prisma.package.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.showcase.findMany({ where: { isPublished: true, isFeatured: true }, orderBy: { order: "asc" }, take: 3 }),
    prisma.education.findMany({ where: { isPublished: true }, orderBy: { order: "asc" }, take: 3 }),
    prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { order: "asc" } }),
    prisma.siteSettings.findMany(),
  ]);

  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => {
    settings[s.key] = s.value;
  });

  return { packages, showcases, educations, testimonials, settings };
}

export default async function HomePage() {
  const { packages, showcases, educations, testimonials, settings } = await getHomeData();
  const whatsappNumber = settings.whatsappNumber || "628xxxxxxxxxx";

  return (
    <SessionProvider>
      <FoundingMemberBanner />
      <Navbar />
      <main>
        <HeroSection settings={settings} />
        <WhatPegaDoesSection />
        <HowItWorksSection />
        <PackagesSection packages={packages} whatsappNumber={whatsappNumber} />
        <ComparisonSection />
        <UseCaseSection />
        <TrustSection />
        <TestimonialsSection testimonials={testimonials} />
        <ShowcaseSection showcases={showcases} />
        <EducationSection educations={educations} />
        <FAQSection />
        <CTABannerSection whatsappNumber={whatsappNumber} />
      </main>
      <Footer />
    </SessionProvider>
  );
}
