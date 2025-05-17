"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const themes = [
  { id: "volcano", name: "Volcanic Chambers" },
  { id: "catacombs", name: "Ancient Catacombs" },
  { id: "frost", name: "Frost Caverns" },
  { id: "arcane", name: "Arcane Library" },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center justify-between gap-2 text-muted-foreground">
          <span>{currentTheme.name}</span>
          <ChevronDown size={16} className={isOpen ? "transform rotate-180 transition-transform" : "transition-transform"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => setTheme(item.id as any)}
            className="flex items-center justify-between cursor-pointer text-muted-foreground"
          >
            {item.name}
            {theme === item.id && <Check size={16} className="ml-2 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}