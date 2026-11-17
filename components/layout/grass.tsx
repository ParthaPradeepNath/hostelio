import type { CSSProperties } from "react";

const Grass = () => {
  const blades = Array.from({ length: 150 }, (_, i) => ({
    id: `b-${i}`,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 3}px`,
    height: `${Math.random() * 80 + 40}px`,
    base: `${(Math.random() - 0.5) * 12}deg`,
    sway: `${Math.random() * 4 + 2.5}deg`,
    dur: `${Math.random() * 1.8 + 3.4}s`,
    delay: `${Math.random() * 2.3}s`,
  }));

  const stems = Array.from({ length: 25 }, (_, i) => {
    const colors = ["#c9bde4", "#e7b7c4", "#ead9a0", "#eec7a8", "#8da7ff"];
    const flowerColor = colors[Math.floor(Math.random() * colors.length)];
    return {
      id: `s-${i}`,
      left: `${Math.random() * 100}%`,
      height: `${Math.random() * 40 + 60}px`,
      base: `${(Math.random() - 0.5) * 12}deg`,
      sway: `${Math.random() * 4 + 2.5}deg`,
      dur: `${Math.random() * 1.8 + 3.4}s`,
      delay: `${Math.random() * 2.3}s`,
      flowerColor,
      flowerSize: `${Math.random() * 4 + 10}px`,
      petalWidth: `${Math.random() * 2 + 4}px`,
      petalHeight: `${Math.random() * 2 + 6}px`,
      flowerRotation: `${Math.random() * 360}deg`,
    };
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-10 mx-auto w-[95vw] lg:w-[62vw] xl:w-[52vw] 2xl:w-[44vw] 2xl:max-w-[850px]"
    >
      <style>{`
        .grass-blade, .grass-stem {
          transform-origin: bottom;
          animation: grass-sway var(--dur, 4s) ease-in-out var(--delay, 0s) infinite;
          will-change: transform;
        }
        @keyframes grass-sway {
          0%, 100% {
            transform: rotate(calc(var(--base, 0deg) - var(--sway, 3deg)));
          }
          50% {
            transform: rotate(calc(var(--base, 0deg) + var(--sway, 3deg)));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .grass-blade, .grass-stem {
            animation: none;
          }
        }
      `}</style>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "122px" }}
      >
        {blades.map((b) => (
          <span
            key={b.id}
            className="absolute bottom-0"
            style={{ left: b.left, transformOrigin: "bottom center" }}
          >
            <span
              className="grass-blade block bg-[#a6c9a9]/50 dark:bg-[#a6c9a9]/40"
              style={
                {
                  width: b.width,
                  height: b.height,
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  "--base": b.base,
                  "--sway": b.sway,
                  "--dur": b.dur,
                  "--delay": b.delay,
                } as CSSProperties
              }
            />
          </span>
        ))}
        {stems.map((s) => (
          <span
            key={s.id}
            className="absolute bottom-0"
            style={{ left: s.left, transformOrigin: "bottom center" }}
          >
            <span
              className="grass-stem relative block"
              style={
                {
                  width: "2px",
                  height: s.height,
                  "--base": s.base,
                  "--sway": s.sway,
                  "--dur": s.dur,
                  "--delay": s.delay,
                } as CSSProperties
              }
            >
              <span className="absolute inset-0 rounded-full bg-[#a6c9a9]/60 dark:bg-[#a6c9a9]/45" />
              <span
                className="absolute top-0 left-1/2"
                style={
                  {
                    width: s.flowerSize,
                    height: s.flowerSize,
                    transform: `translate(-50%, -50%) rotate(${s.flowerRotation})`,
                  } as CSSProperties
                }
              >
                {[0, 72, 144, 216, 288].map((deg, idx) => (
                  <span
                    key={idx}
                    className="absolute top-1/2 left-1/2 rounded-full opacity-70 dark:opacity-55"
                    style={
                      {
                        width: s.petalWidth,
                        height: s.petalHeight,
                        background: s.flowerColor,
                        transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-3px)`,
                      } as CSSProperties
                    }
                  />
                ))}
                <span
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e0b551] opacity-80 dark:opacity-65"
                  style={{ width: "4px", height: "4px" }}
                />
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Grass;
