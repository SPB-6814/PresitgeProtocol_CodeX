import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TriageDashboard from "@/components/TriageDashboard";
import RescueMap from "@/components/RescueMap";
import WellnessCalendar from "@/components/WellnessCalendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <TriageDashboard />
      <RescueMap />
      <WellnessCalendar />
    </main>
  );
}
