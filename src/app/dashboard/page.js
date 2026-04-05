import Navbar from "@/components/common/Navbar";
import AnimatedBackground from "@/components/custom/AnimatedBackground";

export const metadata = {
  title: "Dashboard | Proctora",
  description: "Your Proctora dashboard",
};

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9333ea]">Dashboard</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Welcome back to <span className="text-[#9333ea]">Proctora</span>
          </h1>
          <p className="mt-5 max-w-2xl text-zinc-500">
            Your authenticated session is active. This placeholder route is ready for your
            dashboard widgets, analytics, and exam workflows.
          </p>
        </main>
      </div>
    </div>
  );
}
