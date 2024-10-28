"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "@/styles/style.css";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

const isBrowser = typeof window !== "undefined";

interface ModeAnimationHook {
  ref: React.RefObject<HTMLButtonElement>;
  toggleSwitchTheme: () => Promise<void>;
  isDarkMode: boolean;
}

interface ModeAnimationOptions {
  duration?: number;
  easing?: string;
  pseudoElement?: string;
  globalClassName?: string;
}

export const useModeAnimation = (
  props?: ModeAnimationOptions,
): ModeAnimationHook => {
  const {
    duration = 750,
    easing = "ease-in-out",
    pseudoElement = "::view-transition-new(root)",
    globalClassName = "dark",
  } = props || {};
  const [isDarkMode, setIsDarkMode] = useState(
    isBrowser ? localStorage.getItem("theme") === "dark" : false,
  );
  const ref = useRef<HTMLButtonElement>(null);

  const toggleSwitchTheme = async () => {
    const startViewTransition = document?.startViewTransition?.bind(document);

    if (
      !ref.current ||
      !startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsDarkMode((isDarkMode) => !isDarkMode);
      return;
    }

    await startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode((isDarkMode) => !isDarkMode);
      });
    }).ready;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing,
        pseudoElement,
      },
    );
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add(globalClassName);
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove(globalClassName);
      localStorage.theme = "light";
    }
  }, [isDarkMode, globalClassName]);

  return {
    ref,
    toggleSwitchTheme,
    isDarkMode,
  };
};

export interface SwitchDarkModeProps {
  className?: string;
}
const SwitchDarkMode: React.FC<SwitchDarkModeProps> = () => {
  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation();

  return (
    <Button
      ref={ref}
      onClick={toggleSwitchTheme}
      variant="ghost"
      className="h-8 w-8 px-0"
    >
      <span className="sr-only">Enable dark mode</span>
      {isDarkMode ? (
        <Icon className="h-6 w-6 fill-current !h-6 !w-6" icon="circum:dark" />
      ) : (
        <Icon className="h-6 w-6 fill-current !h-6 !w-6" icon="circum:light" />
      )}
    </Button>
  );
};

export default SwitchDarkMode;
