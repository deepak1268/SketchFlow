import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#111217]">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <Footer />
    </div>
  );
}
