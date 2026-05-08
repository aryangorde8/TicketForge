import { useEffect, useRef } from "react";

interface AtmosphereProps {
  withDotgrid?: boolean;
  withCursorGlow?: boolean;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Atmosphere({
  withDotgrid = true,
  withCursorGlow = false,
  opacity,
  className = "",
  style,
}: AtmosphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!withCursorGlow) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const parent = containerRef.current?.parentElement;
    const glow = glowRef.current;
    if (!parent || !glow) return;

    function onMove(e: MouseEvent) {
      const r = parent!.getBoundingClientRect();
      glow!.style.left = e.clientX - r.left + "px";
      glow!.style.top = e.clientY - r.top + "px";
      glow!.style.opacity = "1";
    }
    function onLeave() {
      glow!.style.opacity = "0";
    }
    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, [withCursorGlow]);

  return (
    <>
      <div ref={containerRef} className={`atmos ${className}`} style={style} aria-hidden>
        <div className="aurora" style={opacity != null ? { opacity } : undefined}>
          <i />
        </div>
        {withDotgrid ? <div className="dotgrid" /> : null}
      </div>
      {withCursorGlow ? <div ref={glowRef} className="cursor-glow" aria-hidden /> : null}
    </>
  );
}

export function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            const target = e.target as HTMLElement;
            setTimeout(() => target.classList.add("in"), i * 60);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function useMagnet() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>(".magnet").forEach((el) => {
      function onMove(e: MouseEvent) {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
      }
      function onLeave() {
        el.style.transform = "";
      }
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    document.querySelectorAll<HTMLElement>(".tiltable").forEach((el) => {
      function onMove(e: MouseEvent) {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * 6;
        const ry = (x - 0.5) * 6;
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      function onLeave() {
        el.style.transform = "";
      }
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, []);
}
