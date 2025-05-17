"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ThemeType = "catacombs" | "volcano" | "frost" | "arcane";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "catacombs",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("volcano");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme} className="w-full">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}