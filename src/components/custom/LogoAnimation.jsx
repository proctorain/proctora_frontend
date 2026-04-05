export default function LogoAnimation({
  className = "",
  compact = false,
  showTagline = true,
}) {
  const shouldShowTagline = showTagline && !compact;

  return (
    <div className={`logo-animation ${className}`} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={compact ? "52 80 512 192" : "0 0 680 350"}
        className="logo-svg"
        role="img"
        aria-label="Proctora logo"
      >
        <defs>
          <clipPath id="bar1clip">
            <rect x="136" y="138" width="48" height="6" rx="3" />
          </clipPath>
          <clipPath id="bar2clip">
            <rect x="136" y="152" width="36" height="6" rx="3" />
          </clipPath>
          <clipPath id="bar3clip">
            <rect x="136" y="166" width="44" height="6" rx="3" />
          </clipPath>
          <clipPath id="bar4clip">
            <rect x="136" y="180" width="28" height="6" rx="3" />
          </clipPath>
        </defs>

        <circle
          className="outer-ring"
          cx="160"
          cy="170"
          r="88"
          fill="none"
          stroke="#a855f7"
          strokeWidth="3"
          strokeDasharray="8 4"
        />

        <circle
          className="inner-ring"
          cx="160"
          cy="170"
          r="72"
          fill="none"
          stroke="#7e22ce"
          strokeWidth="1.5"
        />

        <g className="shield-group">
          <path
            d="M160 98 L201 115 L201 168 C201 196 183 218 160 228 C137 218 119 196 119 168 L119 115 Z"
            fill="#9333ea"
          />
          <path
            d="M160 108 L193 122 L193 166 C193 189 178 208 160 217 L160 108 Z"
            fill="#a855f7"
            opacity="0.3"
          />
        </g>

        <g className="bar bar1" clipPath="url(#bar1clip)">
          <rect x="136" y="138" width="48" height="6" rx="3" fill="#fff" opacity="0.9" />
        </g>
        <g className="bar bar2" clipPath="url(#bar2clip)">
          <rect x="136" y="152" width="36" height="6" rx="3" fill="#fff" opacity="0.9" />
        </g>
        <g className="bar bar3" clipPath="url(#bar3clip)">
          <rect x="136" y="166" width="44" height="6" rx="3" fill="#fff" opacity="0.9" />
        </g>
        <g className="bar bar4" clipPath="url(#bar4clip)">
          <rect x="136" y="180" width="28" height="6" rx="3" fill="#fff" opacity="0.9" />
        </g>

        <g className="badge-group">
          <circle cx="191" cy="200" r="16" fill="#fff" />
          <circle cx="191" cy="200" r="14" fill="#c084fc" />
          <polyline
            className="checkmark"
            points="184,200 189,206 199,193"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g className="wordmark-group">
          <text
            x="284"
            y="186"
            fontFamily="-apple-system, 'Helvetica Neue', Arial, sans-serif"
            fontSize="52"
            fontWeight="700"
            fill="#7e22ce"
          >
            Proctora
          </text>
          {shouldShowTagline && (
            <text
              x="286"
              y="218"
              fontFamily="-apple-system, 'Helvetica Neue', Arial, sans-serif"
              fontSize="14"
              fontWeight="500"
              fill="#a855f7"
              letterSpacing="4"
            >
              PROCTORED QUIZ PLATFORM
            </text>
          )}
        </g>

        <g className="dots dots-tr">
          <circle cx="228" cy="108" r="2.5" fill="#7e22ce" />
          <circle cx="240" cy="108" r="2.5" fill="#7e22ce" />
          <circle cx="252" cy="108" r="2.5" fill="#7e22ce" />
          <circle cx="228" cy="120" r="2.5" fill="#7e22ce" />
          <circle cx="240" cy="120" r="2.5" fill="#7e22ce" />
          <circle cx="228" cy="132" r="2.5" fill="#7e22ce" />
        </g>

        <g className="dots dots-bl">
          <circle cx="72" cy="218" r="2.5" fill="#7e22ce" opacity="0.5" />
          <circle cx="84" cy="218" r="2.5" fill="#7e22ce" opacity="0.5" />
          <circle cx="72" cy="230" r="2.5" fill="#7e22ce" opacity="0.5" />
          <circle cx="84" cy="230" r="2.5" fill="#7e22ce" opacity="0.5" />
          <circle cx="96" cy="230" r="2.5" fill="#7e22ce" opacity="0.5" />
        </g>
      </svg>

      <style jsx>{`
        .logo-animation {
          display: block;
          line-height: 0;
          max-width: 100%;
        }

        .logo-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .outer-ring {
          transform-origin: 160px 170px;
          animation: ring-spin 16s linear infinite;
        }

        .inner-ring {
          animation: inner-breathe 3.2s ease-in-out infinite;
        }

        .shield-group {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: shield-pop 780ms cubic-bezier(0.22, 1.12, 0.3, 1) 180ms forwards;
        }

        .bar {
          opacity: 0;
          transform: translateX(-54px);
          animation: bar-slide 420ms ease-out forwards;
        }

        .bar1 {
          animation-delay: 620ms;
        }

        .bar2 {
          animation-delay: 730ms;
        }

        .bar3 {
          animation-delay: 840ms;
        }

        .bar4 {
          animation-delay: 950ms;
        }

        .badge-group {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: badge-pop 650ms cubic-bezier(0.2, 1.2, 0.2, 1) 1080ms forwards;
        }

        .checkmark {
          stroke-dasharray: 28;
          stroke-dashoffset: 28;
          animation: checkmark-draw 540ms ease-out 1460ms forwards;
        }

        .wordmark-group {
          opacity: 0;
          transform: translateY(12px);
          animation: copy-rise 640ms ease-out 1320ms forwards;
        }

        .dots {
          opacity: 0;
          animation: dots-fade 500ms ease-out 1720ms forwards;
        }

        @keyframes ring-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes inner-breathe {
          0%,
          100% {
            opacity: 0.48;
            stroke-width: 1.35;
          }
          50% {
            opacity: 1;
            stroke-width: 2;
          }
        }

        @keyframes shield-pop {
          0% {
            opacity: 0;
            transform: scale(0.72);
          }
          68% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bar-slide {
          0% {
            opacity: 0;
            transform: translateX(-54px);
          }
          100% {
            opacity: 0.9;
            transform: translateX(0);
          }
        }

        @keyframes badge-pop {
          0% {
            opacity: 0;
            transform: scale(0.25);
          }
          62% {
            opacity: 1;
            transform: scale(1.16);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes checkmark-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes copy-rise {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dots-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .outer-ring,
          .inner-ring,
          .shield-group,
          .bar,
          .badge-group,
          .checkmark,
          .wordmark-group,
          .dots {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .checkmark {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}