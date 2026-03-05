import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthRightPanel from "@/components/custom/AuthRightPanel";

// Auth pages share this layout — two-column on desktop, single-column on mobile.
// Left: clean white with the form. Right: deep-purple decorative panel (hidden on mobile).
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row">
      {/* LEFT — form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 md:py-12">
        {/* Back to home — always visible above the form */}
        <div className="absolute top-5 left-5 sm:top-6 sm:left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7e22ce] hover:text-[#6d28d9] hover:underline transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>

        {children}
      </div>

      {/* RIGHT — decorative panel, desktop only */}
      <div className="hidden md:block md:w-1/2 lg:w-[52%] sticky top-0 h-screen">
        <AuthRightPanel />
      </div>
    </div>
  );
}
