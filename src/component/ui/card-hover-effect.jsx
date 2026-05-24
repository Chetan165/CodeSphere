import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";

export const HoverEffect = ({ items, className }) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);
  const MotionSpan = motion.span;

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 py-4",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.link}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <MotionSpan
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block  rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </a>
      ))}
    </div>
  );
};

export const Card = ({ className, children }) => {
  return (
    <div
      className={cn(
        "rounded-3xl h-full w-full overflow-hidden border border-white/10 bg-neutral-950/85 p-1 shadow-[0_0_24px_rgba(15,23,42,0.22)] transition-all duration-300 group-hover:border-sky-400/30 group-hover:shadow-[0_0_28px_rgba(56,189,248,0.12)] relative z-20 backdrop-blur-md",
        className,
      )}
    >
      <div className="relative z-50">
        <div className="rounded-[20px] border border-white/5 bg-white/[0.02] p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
export const CardTitle = ({ className, children }) => {
  return (
    <h4
      className={cn(
        "mt-2 text-sm font-semibold tracking-wide text-zinc-100",
        className,
      )}
    >
      {children}
    </h4>
  );
};
export const CardDescription = ({ className, children }) => {
  // If children is a string and contains <br/>, render as HTML
  if (typeof children === "string" && children.includes("<br/>")) {
    return (
      <p
        className={cn(
          "mt-4 text-sm leading-6 tracking-wide text-zinc-400",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }
  return (
    <p
      className={cn(
        "mt-4 text-sm leading-6 tracking-wide text-zinc-400",
        className,
      )}
    >
      {children}
    </p>
  );
};
