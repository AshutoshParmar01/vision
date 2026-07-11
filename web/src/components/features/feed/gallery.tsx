import { useRef } from "react";
// import { CanvasRevealEffectDemo3 } from "#components/features/backgrounds/background"; 
import { FocusCardsDemo } from './samplephotos'; 
import { FloatingDock } from "@/components/ui/floating-dock"; 
import { TracingBeam } from "../../ui/tracing-beam"; 
import { navigationLinks } from "../../ui/dock-links";

const gallery = () => { 
  const containerRef = useRef(null);

  

  return ( 
    <div className="relative min-h-screen w-full bg-transparent antialiased"> 
      <div className="absolute inset-0 z-0">
        
      </div>

      {/* Adding overflow-hidden and bounding layout constraints stops line blowouts */}
      <div ref={containerRef} className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24 overflow-hidden">
        <TracingBeam className="h-full">
          <div className="pb-12">
            <FocusCardsDemo /> 
          </div>
        </TracingBeam>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center h-auto w-auto"> 
        <FloatingDock items={navigationLinks} /> 
      </div> 
    </div> 
  ); 
}; 

export default gallery;
