import { Navbar } from "@/app/components/Navbar";
import { Hero } from "@/app/components/landing/Hero";
import { Features } from "@/app/components/landing/Features";
import { CTA } from "@/app/components/landing/CTA";
import { Footer } from "@/app/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
