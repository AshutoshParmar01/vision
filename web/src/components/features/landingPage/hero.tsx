"use client";
import { motion } from "motion/react";
import { LampContainer } from "../../ui/lamp";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome,
    IconMail,
    IconUser,
    IconBrandLinkedin,
     IconBrandGithub
 } from '@tabler/icons-react';

export function LampDemo() {
    const links = [
        {
            title : "home",
            icon : (
                <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href : "/"
        },{
            title : "mail",
            icon : (
                <IconMail className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href : "#"
        },{
            title : "linkedin",
            icon : (
                <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300"/>
            ),
            href : "#"
        },{
            title : "github",
            icon : (
                <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300"/>
            ),
            href : "#"
        },{
            title : "user",
            icon : (
                <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300"/> 
            ),
            href : "/signup"
        }
    ]
  return (
  <div className="relative min-h-screen w-full overflow-hidden">
    <LampContainer className="">
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0 }}
        className="mt-8 bg-linear-to-br from-slate-100 to-slate-600 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        <EncryptedText text="Pxe Photos" encryptedClassName="text-neutral-500" revealedClassName="dark:text-white text-black" revealDelayMs={50} />
        <br />
        <EncryptedText text="Upload. Segregate. Breathe." encryptedClassName="text-neutral-500" revealedClassName="dark:text-white text-black" revealDelayMs={50} />
      </motion.h1>
    </LampContainer>

    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center h-auto w-auto">
      <FloatingDock items={links} />
    </div>
  </div>
);
}
