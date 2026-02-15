import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
<<<<<<< HEAD
import { Categories } from "@/components/sections/categories";
import { Features } from "@/components/sections/features";
=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
import { Stats } from "@/components/sections/stats";

export default function Home() {
  return (
    <>
      <Navbar />
<<<<<<< HEAD
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <Hero />
        <Categories />
        <Features />
=======
      <main className="min-h-screen">
        <Hero />
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
        <Stats />
      </main>
      <Footer />
    </>
  );
}

