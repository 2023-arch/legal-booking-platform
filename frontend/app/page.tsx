"use client";

import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedLawyersSection from "@/components/home/FeaturedLawyersSection";
import SpecializationsSection from "@/components/home/SpecializationsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />
            <StatsSection />
            <HowItWorksSection />
            <FeaturedLawyersSection />
            <SpecializationsSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </div>
    );
}
