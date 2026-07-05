"use client";
import { motion } from "motion/react";
import { LampContainer } from "../../ui/lamp";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconMail,
  IconUser,
  IconBrandLinkedin,
  IconBrandGithub,
  IconCloudUpload,
  IconFolders,
  IconShieldLock,
} from "@tabler/icons-react";

export function LampDemo() {
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-cyan-400/80 dark:text-cyan-300" />
      ),
      href: "/",
    },
    {
      title: "Email me",
      icon: (
        <IconMail className="h-full w-full text-cyan-400/80 dark:text-cyan-300" />
      ),
      href: "mailto:abhis030505@gmail.com",
      
    },
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-cyan-400/80 dark:text-cyan-300" />
      ),
      href: "https://www.linkedin.com/in/abhishek-yadav03/",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-cyan-400/80 dark:text-cyan-300" />
      ),
      href: "https://github.com/pxe-photos",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      title: "Sign up",
      icon: (
        <IconUser className="h-full w-full text-cyan-400/80 dark:text-cyan-300" />
      ),
      href: "/signup",
    },
  ];

  const features = [
    {
      icon: <IconCloudUpload className="h-6 w-6 text-cyan-400" />,
      title: "Upload in bulk",
      body: "Drop thousands of photos. Pxe streams them in without freezing your browser tab.",
    },
    {
      icon: <IconFolders className="h-6 w-6 text-cyan-400" />,
      title: "Auto-segregate",
      body: "Photos sort themselves into events, faces, and duplicates — no manual folders, no guesswork.",
    },
    {
      icon: <IconShieldLock className="h-6 w-6 text-cyan-400" />,
      title: "Private by default",
      body: "Your library stays yours. Nothing is scanned for ads, nothing is sold, nothing leaves without you.",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-950">
      {/* HERO — LampContainer clips content taller than itself, so the headline
          previously sat partly under that clip mask. Keeping the hero content
          short and centered (no CTA/subtext crammed in here) fixes the
          "text hidden" issue. Supporting copy now lives just below, in normal
          document flow, safely outside the clipped region. */}
      <LampContainer>
        <motion.h1
          initial={{ opacity: 0.3, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
          className="mt-8 bg-linear-to-br from-slate-100 to-slate-600 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
        >
          <EncryptedText
            text="Pxe Photos"
            encryptedClassName="text-neutral-500"
            revealedClassName="dark:text-white text-black"
            revealDelayMs={50}
          />
          <br />
          <EncryptedText
            text="Upload. Segregate. Breathe."
            encryptedClassName="text-neutral-500"
            revealedClassName="dark:text-white text-black"
            revealDelayMs={50}
          />
        </motion.h1>
      </LampContainer>

      {/* SUBTEXT + CTA — sits right under the lamp, in normal flow, so it can
          never get clipped no matter how tall the viewport is. */}
      <div className="relative z-20 -mt-24 flex flex-col items-center px-6 text-center md:-mt-36">
        <motion.a
          href="/signup"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-6 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:border-cyan-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Get started free
        </motion.a>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-6 max-w-md text-sm text-neutral-400 md:text-base"
        >
          A calmer home for your camera roll. Upload once, and let Pxe do the
          sorting, tagging, and de-duplicating for you.
        </motion.p>
      </div>

      {/* FEATURES — gives the page a job beyond the hero animation, and a
          reason to keep scrolling instead of bouncing after the lamp plays. */}
      <section className="relative z-20 mx-auto mt-32 max-w-5xl px-6 pb-32">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-cyan-500/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/10">
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-100">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER — small, quiet closer so the page doesn't just end abruptly
          after the feature grid. */}
      <footer className="relative z-20 border-t border-white/10 px-6 py-10 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Pxe Photos. Built for people with too
        many camera rolls.
      </footer>

      <div className="fixed bottom-8 left-1/2 z-50 flex h-auto w-auto -translate-x-1/2 items-center justify-center sm:bottom-12">
        <FloatingDock items={links} />
      </div>
    </div>
  );
}