"use client";
import { cn } from "../../utils/cn";
import React, { useState, createContext, useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";

const SidebarContext = createContext(undefined);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  return (
    <>
      <div
        className={cn(
          "group/sidebar fixed left-0 top-0 hidden h-screen w-[60px] overflow-hidden border-r border-neutral-200 bg-neutral-100 px-4 py-4 transition-[width] duration-300 ease-out will-change-[width] hover:delay-75 dark:border-neutral-700 dark:bg-neutral-800 md:flex md:flex-col hover:w-[300px] z-30",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 h-12 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full z-40 border-b border-neutral-200 dark:border-neutral-700",
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        {open && (
          <div
            className={cn(
              "fixed inset-0 z-[100] flex h-screen w-full flex-col justify-between border-r border-neutral-200 bg-white p-10 dark:border-neutral-700 dark:bg-neutral-900",
              className,
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children}
          </div>
        )}
      </div>
    </>
  );
};

export const SidebarLink = ({ link, className, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <NavLink
      to={link.href}
      onClick={() => {
        try {
          setOpen(false);
        } catch {
          return;
        }
      }}
      className={({ isActive }) =>
        cn(
          "group/sidebar-link flex items-center justify-start gap-2 py-2 overflow-hidden",
          isActive ? "opacity-100" : "opacity-90",
          className,
        )
      }
      {...props}
    >
      <span className="shrink-0 transition-transform duration-200 ease-out group-hover/sidebar-link:scale-110 group-hover/sidebar-link:translate-x-0.5">
        {link.icon}
      </span>
      <span
        className={cn(
          "whitespace-pre text-sm !p-0 !m-0 text-neutral-700 transition-all duration-200 ease-out dark:text-neutral-200",
          open
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-1 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-75",
        )}
      >
        {link.label}
      </span>
    </NavLink>
  );
};
