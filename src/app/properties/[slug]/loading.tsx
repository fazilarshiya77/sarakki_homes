import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";

// Same reasoning as src/app/properties/loading.tsx — only visible on a
// cache miss for this ISR route (revalidate = 60, generateStaticParams
// pre-builds every known slug), mirroring the real detail layout's
// gallery + content column shape so there's no layout jump on swap-in.
export default function PropertyDetailLoading() {
  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-20">
        <Container className="py-10 md:py-14">
          <div className="aspect-[16/9] w-full animate-pulse rounded-lg bg-[#EEE7DA] md:aspect-[21/9]" />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="h-3 w-40 animate-pulse rounded-sm bg-border" />
              <div className="h-9 w-3/4 animate-pulse rounded-sm bg-border" />
              <div className="h-4 w-1/2 animate-pulse rounded-sm bg-border" />
              <div className="mt-6 space-y-2.5">
                <div className="h-3.5 w-full animate-pulse rounded-sm bg-[#EEE7DA]" />
                <div className="h-3.5 w-full animate-pulse rounded-sm bg-[#EEE7DA]" />
                <div className="h-3.5 w-2/3 animate-pulse rounded-sm bg-[#EEE7DA]" />
              </div>
            </div>
            <div className="h-72 animate-pulse rounded-lg bg-[#F7F3EA]" />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
