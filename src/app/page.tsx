import { AppShell } from "@/components/loader/AppShell";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { FeaturedCategories } from "@/components/sections/FeaturedCategories";
import { FeaturedProperties } from "@/components/sections/FeaturedProperties";
import { WhySarakkiHomes } from "@/components/sections/WhySarakkiHomes";
import { AuctionJourney } from "@/components/sections/AuctionJourney";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { CommissionStructure } from "@/components/sections/CommissionStructure";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { getHomepageTestimonials } from "@/lib/testimonials";

// FeaturedProperties and Testimonials both pull live, admin-managed
// content — re-fetch at most once a minute rather than only baking them
// in at build time.
export const revalidate = 60;

export default async function Home() {
  const testimonials = await getHomepageTestimonials();

  return (
    <AppShell>
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <FeaturedProperties />
        <WhySarakkiHomes />
        <AuctionJourney />
        <FeaturedCategories />
        <FAQ />
        <Testimonials testimonials={testimonials} />
        <CommissionStructure />
        <FinalCTA />
      </main>
      <Footer />
    </AppShell>
  );
}
