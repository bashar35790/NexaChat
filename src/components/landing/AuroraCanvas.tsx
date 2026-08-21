"use client";

import { useEffect, useRef } from "react";

/** Drifting radial-gradient orbs — matches the login screen's CSS aurora. */
const ORBS = [
  { rgb: "99,102,241", x: 0.22, y: 0.3, r: 0.48, dx: 0.1, dy: -0.06, speed: 0.13, phase: 0 },
  { rgb: "139,92,246", x: 0.78, y: 0.24, r: 0.4, dx: -0.08, dy: 0.07, speed: 0.11, phase: 2.1 },
  { rgb: "34,211,238", x: 0.58, y: 0.82, r: 0.36, dx: -0.06, dy: -0.08, speed: 0.09, phase: 4.2 },
] as const;

/**
 * Canvas-rendered aurora for the landing hero. DPR-aware, resize-safe, and
 * fully static under prefers-reduced-motion (one pre-drawn frame).
 */
export function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      canvas!.height = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time: number) {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";
      for (const orb of ORBS) {
        const px =
          (orb.x + Math.sin((time * orb.speed) / 1000 + orb.phase) * orb.dx) * w;
        const py =
          (orb.y +
            Math.cos((time * orb.speed * 1.3) / 1000 + orb.phase) * orb.dy) *
          h;
        const pr = orb.r * Math.max(w, h) * 0.5;
        const gradient = ctx!.createRadialGradient(px, py, 0, px, py, pr);
        gradient.addColorStop(0, `rgba(${orb.rgb},0.30)`);
        gradient.addColorStop(0.55, `rgba(${orb.rgb},0.09)`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(px, py, pr, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";
    }

    function loop(time: number) {
      draw(time);
      raf = requestAnimationFrame(loop);
    }

    function stopLoop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function syncMotion(reduce: boolean) {
      stopLoop();
      // Static frame keeps the composition intact without any animation.
      if (reduce) draw(4200);
      else raf = requestAnimationFrame(loop);
    }

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduceChange = () => syncMotion(reduceQuery.matches);
    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else syncMotion(reduceQuery.matches);
    };

    resize();
    syncMotion(reduceQuery.matches);
    window.addEventListener("resize", resize);
    reduceQuery.addEventListener("change", onReduceChange);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      reduceQuery.removeEventListener("change", onReduceChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 size-full"
    />
  );
}
