// src/components/LoginButton.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { LogIn, Settings, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";

export default function FirebaseLoginButton() {
  // Mendapatkan tipe data yang aman dari useAuth()
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const handleLogin = async () => {
    sendGTMEvent({
      event: "action_login",
      user_email: user ? user.email : "guest",
    });
    try {
      await signInWithGoogle();
      // alert('Login berhasil!');
    } catch (error) {
      alert("Login Failed. Please try again.");
      // Penanganan error yang lebih spesifik di sini
    }
  };

  const handleLogout = async () => {
    sendGTMEvent({
      event: "action_logout",
      user_email: user ? user.email : "guest",
    });
    try {
      await signOut();
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  if (loading) {
    return <button disabled>Loading...</button>;
  }

  if (user) {
    const avatarLetter = (user.displayName || user.email || "U")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    // console.log(user);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="ring-1 ring-accent dark:ring-0"
          >
            <Avatar className="h-[2rem] w-[2rem] [&&&]:rounded-sm p-0.5">
              {user.photoURL ? (
                <AvatarImage
                  src={user.photoURL || undefined}
                  alt={avatarLetter}
                  className="rounded-sm object-cover"
                />
              ) : (
                <span className="font-bold text-lg">{avatarLetter}</span>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem disabled>
            <User className="mr-1 h-4 w-4" />
            {user.displayName || user.email || "User"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-2">
            <Link href="/setting" className="flex items-center">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-2">
            <Link href="#" onClick={handleLogout} className="flex items-center">
              <LogOut className="mr-3 h-4 w-4" /> Sign Out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className="ring-1 ring-accent dark:ring-0"
    >
      <LogIn className="h-5 w-5" /> Login{" "}
      <span className="hidden lg:block">for More Feature </span>
    </Button>
  );
}
