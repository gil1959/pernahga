import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import PackagesSection from "@/components/sections/PackagesSection";
import ShowcaseSection from "@/components/sections/ShowcaseSection";
import EducationSection from "@/components/sections/EducationSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTABannerSection from "@/components/sections/CTABannerSection";
import SessionProvider from "@/components/providers/SessionProvider";

async function getHomeData() {
  const [packages, showcases, educations, testimonials, settingsArr] = await Promise.all([
    prisma.package.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.showcase.findMany({ where: { isPublished: true, isFeatured: true }, orderBy: { order: "asc" }, take: 6 }),
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
      <Navbar />
      <main>
        <HeroSection settings={settings} />
        <HowItWorksSection />
        <PackagesSection packages={packages} whatsappNumber={whatsappNumber} />
        <ShowcaseSection showcases={showcases} />
        <EducationSection educations={educations} />
        <TestimonialsSection testimonials={testimonials} />
        <CTABannerSection whatsappNumber={whatsappNumber} />
      </main>
      <Footer />
    </SessionProvider>
  );
}
