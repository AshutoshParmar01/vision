import React from "react";
import {
  IconPhoto,
  IconUsersGroup,
  IconLayoutDashboard,
  IconArrowNarrowUp,
  IconTextScanAi,
  IconCode,
  IconUserCircle
} from "@tabler/icons-react";

export const navigationLinks = [
  {
    title: "feed",
    icon: <IconPhoto className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/gallery"
  },
  {
    title: "people",
    icon: <IconUsersGroup className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/people"
  },
  {
    title: "collections",
    icon: <IconLayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/albums"
  },
  {
    title: "upload",
    icon: <IconArrowNarrowUp className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/upload"
  },
  {
    title: "AI mode",
    icon: <IconTextScanAi className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/stream"
  },
  {
    title: "contribute",
    icon: <IconCode className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "https://github.com/pxe-photos/pxephotos"
  },
  {
    title: "user",
    icon: <IconUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/profile"
  }
];