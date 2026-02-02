import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../component/ui/sidebar.jsx";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconTable,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../utils/cn";
import UserAuth from "../UserAuth.jsx";
import { Code, File, FileQuestion } from "lucide-react";

export function SidebarDemo({ children }) {
  const [User, setUser] = useState();
  useEffect(() => {
    UserAuth(setUser);
  }, []);
  let links = [
    {
      label: "Dashboard",
      href: "/Dashboard",
      icon: (
        <IconTable className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/Profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/Settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Contests",
      href: "/Contests",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  if (User && User.admin) {
    links = [
      ...links,
      {
        label: "Create Contest",
        href: "/admin/contest",
        icon: (
          <Code className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      },
      {
        label: "Create Challenge",
        href: "/admin/problem",
        icon: (
          <File className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      },
    ];
  }
  links.push({
    label: "Logout",
    href: "/Logout",
    icon: (
      <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  });
  return (
    <div className={cn("flex w-screen h-screen overflow-hidden bg-black")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 h-full">
          <div className="flex flex-1 flex-col overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex flex-col flex-1 w-full h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        CodeSphere
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
