import { useEffect } from "react";
import { useThemeStore } from "../store/theme.store";

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bg-clr",
      theme === "dark" ? "hsl(0, 0%, 0%)" : "hsl(0, 0%, 100%)",
    );
    document.documentElement.style.setProperty(
      "--text-clr",
      theme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 20%)",
    );
  }, [theme]);
};
