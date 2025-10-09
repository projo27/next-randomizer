"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { saveThemePreference } from "@/services/user-preferences";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (user) {
      saveThemePreference(user.uid, newTheme);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="ring-1 ring-accent dark:ring-0"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem
          onClick={() => theme != "light" && handleThemeChange("light")}
          className={cn(
            { "bg-accent": theme === "light" },
            { "hover:cursor-pointer": theme !== "light" },
          )}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => theme != "dark" && handleThemeChange("dark")}
          className={cn(
            { "bg-accent": theme === "dark" },
            { "hover:cursor-pointer": theme !== "dark" },
          )}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => theme != "system" && handleThemeChange("system")}
          className={cn(
            { "bg-accent": theme === "system" },
            { "hover:cursor-pointer": theme !== "system" },
          )}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
