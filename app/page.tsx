import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Categories } from "@/components/sections/categories";
import { Features } from "@/components/sections/features";
import { Stats } from "@/components/sections/stats";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <Hero />
        <Categories />
        <Features />
        <Stats />
      </main>
      <Footer />
    </>
  );
}

