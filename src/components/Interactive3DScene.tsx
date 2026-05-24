"use client";

import { useRef } from "react";

export default function Interactive3DScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = sceneRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    el.style.transform = `rotateX(${-y * 18}deg) rotateY(${x * 18}deg)`;
  };

  const handleLeave = () => {
    const el = sceneRef.current;
    if (!el) return;
    el.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="scene-perspective w-full max-w-sm">
      <div
        ref={sceneRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="scene-card relative mx-auto aspect-square w-64 cursor-grab sm:w-72"
      >
        <div className="scene-face absolute inset-0 rounded-3xl border border-white/20 bg-gradient-to-br from-blue-600/90 to-emerald-600/80 p-6 shadow-2xl shadow-blue-900/40 backdrop-blur-xl">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-blue-100">
                3D Scene
              </p>
              <p className="mt-1 text-lg font-semibold text-white">盲道透镜</p>
            </div>

            <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-black/20 p-3">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    i % 5 === 0 || i % 7 === 0
                      ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      : "bg-slate-700/80"
                  }`}
                />
              ))}
            </div>

            <p className="text-center text-xs text-blue-100/80">
              移动鼠标 · 感受立体层次
            </p>
          </div>
        </div>

        <div className="scene-float absolute -right-4 -top-4 rounded-2xl border border-red-400/40 bg-red-500/90 px-3 py-2 text-xs font-semibold text-white shadow-lg">
          占用阻断
        </div>
        <div className="scene-float-delayed absolute -bottom-3 -left-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-white shadow-lg">
          反馈生成
        </div>
      </div>
    </div>
  );
}
