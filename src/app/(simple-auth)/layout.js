import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AnimatedBackground from "@/components/custom/AnimatedBackground";

export default function SimpleAuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 font-sans overflow-hidden">
      <AnimatedBackground />
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7e22ce] hover:text-[#6d28d9] hover:underline transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
      </div>
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
