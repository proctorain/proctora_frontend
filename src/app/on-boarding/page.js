import Navbar from "@/components/common/Navbar";
import AnimatedBackground from "@/components/custom/AnimatedBackground";

export const metadata = {
  title: "On-boarding | Proctora",
  description: "Complete your Proctora on-boarding",
};

export default function OnBoardingPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9333ea]">On-boarding</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Let&apos;s set up your <span className="text-[#9333ea]">Proctora</span> account
          </h1>
          <p className="mt-5 max-w-2xl text-zinc-500">
            Complete your profile details here before continuing. This placeholder route is where
            on-boarding steps, profile setup, and role configuration can be added next.
          </p>
        </main>
      </div>
    </div>
  );
}
