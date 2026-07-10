import { useRef } from "react";
// import { CanvasRevealEffectDemo3 } from "#components/features/backgrounds/background"; 
import { FocusCardsDemo } from './samplephotos'; 
import { FloatingDock } from "@/components/ui/floating-dock"; 
import { TracingBeam } from "../../ui/tracing-beam"; 
import { 
  IconPhoto, 
  IconUsersGroup, 
  IconLayoutDashboard, 
  IconArrowNarrowUp, 
  IconTextScanAi, 
  IconCode, 
  IconUserCircle 
} from '@tabler/icons-react'; 

const gallery = () => { 
  const containerRef = useRef(null);

  const links = [ 
    { title: "feed", icon: <IconPhoto className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/gallery" }, 
    { title: "people", icon: <IconUsersGroup className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/people" }, 
    { title: "collections", icon: <IconLayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/albums" }, 
    { title: "upload", icon: <IconArrowNarrowUp className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/upload" }, 
    { title: "AI mode", icon: <IconTextScanAi className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/stream" }, 
    { title: "contribute", icon: <IconCode className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "https://github.com/pxe-photos/pxephotos" }, 
    { title: "user", icon: <IconUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/profile" }, 
  ];

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
        <FloatingDock items={links} /> 
      </div> 
    </div> 
  ); 
}; 

export default gallery;
