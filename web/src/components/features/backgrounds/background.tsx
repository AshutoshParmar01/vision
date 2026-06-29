// @/components/canvas-reveal-bg.tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

interface BackgroundProps {
  hovered: boolean;
}

export function CanvasRevealEffectDemo3({ hovered }: BackgroundProps) {
  return (
    // Note: Removed mouse listeners from here, added pointer-events-none to prevent interaction lag
    <div className="fixed inset-0 -z-10 h-screen w-screen flex flex-col lg:flex-row overflow-hidden items-center justify-center bg-linear-to-br from-black via-blue-950 to-gray-600 gap-4 pointer-events-none">
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full absolute inset-0"
          >
            <CanvasRevealEffect
              animationSpeed={2}
              containerClassName="bg-transparent"
              colors={[
                [59, 130, 246],
                [139, 92, 246],
              ]}
              opacities={[0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 1]}
              dotSize={2.2}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 mask-[radial-gradient(400px_at_center,white,transparent)] bg-black/50 dark:bg-black/90" />
    </div>
  );
}
