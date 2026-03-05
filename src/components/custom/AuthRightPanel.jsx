// Decorative right panel for all auth pages — deep purple with faster bubbles.
// Hidden on mobile (the layout handles that with md:block).
export default function AuthRightPanel() {
  return (
    <div className="auth-panel" aria-hidden="true">
      {/* Faster-moving purple bubbles on dark background */}
      <div className="bubble-r bubble-r-1" />
      <div className="bubble-r bubble-r-2" />
      <div className="bubble-r bubble-r-3" />
      <div className="bubble-r bubble-r-4" />
      <div className="bubble-r bubble-r-5" />

      {/* Branding & tagline */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 text-center">
        <h1
          className="text-5xl font-bold text-white lg:text-6xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          Proctora
        </h1>

        <p className="mt-5 max-w-sm text-lg leading-relaxed text-purple-200">
          Secure. Fair. Uncompromised. The trusted platform for modern, reliable
          exam administration.
        </p>

        {/* Feature bullets */}
        <ul
          className="mt-10 flex flex-col gap-3 text-sm text-purple-300"
          aria-label="Features"
        >
          <li className="flex items-center gap-2">
            <span className="text-purple-400" aria-hidden="true">
              ✦
            </span>
            Tamper-proof exam environments
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400" aria-hidden="true">
              ✦
            </span>
            Real-time proctoring soon!
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400" aria-hidden="true">
              ✦
            </span>
            Building trust between students and teachers
          </li>
        </ul>
      </div>
    </div>
  );
}
