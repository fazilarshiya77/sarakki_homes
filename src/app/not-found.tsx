import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";

export default function NotFound() {
  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-40 text-center">
        <Container className="flex flex-col items-center">
          <p className="font-display text-[clamp(5rem,14vw,9rem)] leading-none tracking-[-0.02em] text-accent-gold-dark/20">
            404
          </p>
          <h1 className="mt-4 font-display text-3xl tracking-[-0.01em] md:text-4xl">
            This address doesn&rsquo;t exist — even on our verified title records.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            The page you&rsquo;re looking for may have moved or never existed.
            Let&rsquo;s get you back to solid ground.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className={buttonClasses("primary")}>
              <ButtonFX />
              <Home size={16} />
              Back to Home
            </Link>
            <Link href="/properties" className={buttonClasses("secondary")}>
              <ButtonFX />
              <Search size={16} />
              Browse Properties
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
