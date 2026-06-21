import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../component/ui/sidebar.jsx";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconTable,
  IconUserBolt,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import UserAuth from "../UserAuth.jsx";
import { Code, File, FileQuestion, UserIcon } from "lucide-react";

export function SidebarDemo({ children }) {
  const [User, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await UserAuth((u) => {
          if (!mounted) return;
          setUser(u);
        });
      } catch {
        // ignore; UserAuth already shows errors/toasts
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  let links = [
    {
      label: "Dashboard",
      href: "/dashboard",
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
  const userData = User;
  if (userData && userData.admin) {
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
  const avatarSrc = userData?.photos?.[0]?.value || null;
  if (loadingUser) {
    return (
      <div className="relative flex w-screen h-screen overflow-hidden bg-black">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 h-full">
            <div className="flex flex-1 flex-col overflow-x-hidden p-4">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
                <div className="h-4 w-24 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
              <div className="mt-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 w-3/4 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="h-7 w-7 rounded-full bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex flex-col flex-1 w-full h-full overflow-y-auto pl-[60px] md:pl-[60px] p-6">
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="h-48 w-full bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-32 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-32 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div
      className={cn("relative flex w-screen h-screen overflow-hidden bg-black")}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 h-full">
          <div className="flex flex-1 flex-col overflow-x-hidden">
            <Logo open={open} />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: userData ? userData.displayName : "",
                href: "/dashboard",

                icon: avatarSrc ? (
                  <img
                    src={avatarSrc}
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ) : (
                  <UserIcon className="h-7 w-7 shrink-0 rounded-full text-neutral-400" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex flex-col flex-1 w-full h-full overflow-y-auto pl-[60px] md:pl-[60px]">
        {children}
      </main>
    </div>
  );
}
export const Logo = ({ open }) => {
  return (
    <Link
      to="/"
      className="relative z-20 flex items-center gap-2 overflow-hidden py-1 text-sm font-normal text-black dark:text-white"
    >
      <img
        src="/code.png"
        alt="Logo"
        className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm "
      />
      <span
        className={cn(
          "font-medium whitespace-pre transition-all duration-150",
          open ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100",
        )}
      >
        CodeSphere
      </span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};
