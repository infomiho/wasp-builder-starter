import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { features } from "./contentSections";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="isolate">
        <Hero />
        <Features features={features} />
      </div>
      <Footer />
    </div>
  );
}
