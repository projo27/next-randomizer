// src/components/LoginButton.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { LogIn } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function FirebaseLoginButton() {
  // Mendapatkan tipe data yang aman dari useAuth()
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // alert('Login berhasil!');
    } catch (error) {
      alert("Login Failed. Please try again.");
      // Penanganan error yang lebih spesifik di sini
    }
  };

  const handleLogout = async () => {
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
            {user.displayName || user.email || "User"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
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
