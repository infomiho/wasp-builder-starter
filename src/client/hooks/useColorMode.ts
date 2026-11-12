import { useLayoutEffect, useSyncExternalStore } from "react";

type ColorMode = "light" | "dark";

const COLOR_MODE_STORAGE_KEY = "color-mode";
const DARK_MODE_CLASS = "dark";

const listeners = new Set<() => void>();
let currentColorMode: ColorMode | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readSavedColorMode(): ColorMode {
  try {
    return window.localStorage.getItem(COLOR_MODE_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function readColorMode(): ColorMode {
  currentColorMode ??= readSavedColorMode();
  return currentColorMode;
}

// Prerendered pages are built without a browser, so they always start light.
function readPrerenderColorMode(): ColorMode {
  return "light";
}

function setColorMode(colorMode: ColorMode) {
  currentColorMode = colorMode;
  try {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
  } catch {
    // Without storage, e.g. in some private windows, the choice lasts until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

/** The saved color mode and a setter. Every component that uses it stays in sync. */
export function useColorMode() {
  const colorMode = useSyncExternalStore(
    subscribe,
    readColorMode,
    readPrerenderColorMode,
  );
  return [colorMode, setColorMode] as const;
}

/** Applies the saved color mode to the whole page. `App` calls it, so it works on every route. */
export function useApplyColorMode() {
  const [colorMode] = useColorMode();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(
      DARK_MODE_CLASS,
      colorMode === "dark",
    );
  }, [colorMode]);
}
