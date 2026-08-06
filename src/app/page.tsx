import { AppShell } from "@/components/loader/AppShell";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { FeaturedCategories } from "@/components/sections/FeaturedCategories";
import { FeaturedProperties } from "@/components/sections/FeaturedProperties";
import { WhySarakkiHomes } from "@/components/sections/WhySarakkiHomes";
import { AuctionJourney } from "@/components/sections/AuctionJourney";
import { TopBuilders } from "@/components/sections/TopBuilders";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <AppShell>
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <FeaturedProperties />
        <WhySarakkiHomes />
        <AuctionJourney />
        <FeaturedCategories />
        <TopBuilders />
        <FAQ />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </AppShell>
  );
}
