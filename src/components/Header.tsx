"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Lock, Film, BookmarkPlus, LogIn, LogOut } from "lucide-react";

interface HeaderProps {
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
  onAdminStatusChange?: (status: boolean) => void;
  onLogout?: () => void;
  currentView?: "journal" | "watchlist";
}

export function Header({
  isAdmin = false,
  onOpenAdminModal,
  onAdminStatusChange,
  onLogout,
  currentView,
}: HeaderProps) {
  const pathname = usePathname();
  const [isAuthBtnHovered, setIsAuthBtnHovered] = useState(false);

  // If currentView is explicitly provided (e.g. on post detail page), use it;
  // otherwise determine from the active route pathname.
  const isWatchlist = currentView ? currentView === "watchlist" : pathname?.startsWith("/watchlist");
  const isJournal = currentView ? currentView === "journal" : !isWatchlist;

  const handleLogoutClick = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error", err);
    }
    if (onAdminStatusChange) {
      onAdminStatusChange(false);
    }
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121315]/95 backdrop-blur-md border-b border-[#292a2c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-6">
        {/* Left Brand & View Navigation */}
        <div className="flex items-center gap-3 sm:gap-8">
          <Link
            href="/"
            className="flex items-end gap-2 sm:gap-3 group shrink-0 cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="KINO Logo"
              className="h-8 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-headline text-xl sm:text-3xl font-extrabold tracking-tight text-[#f2ca50] group-hover:text-[#e9c349] transition-colors">
              KINO
            </span>
          </Link>

          {/* View Nav Links: Journal vs Watchlist */}
          <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-lg bg-[#1b1c1e] border border-[#292a2c]">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold font-headline transition-all cursor-pointer ${
                isJournal
                  ? "bg-[#f2ca50] text-[#121315] shadow-sm"
                  : "text-[#99907c] hover:text-[#e3e2e5]"
              }`}
            >
              <Film className="w-3.5 h-3.5 shrink-0" />
              <span>Journal</span>
            </Link>

            <Link
              href="/watchlist"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold font-headline transition-all cursor-pointer ${
                isWatchlist
                  ? "bg-[#f2ca50] text-[#121315] shadow-sm"
                  : "text-[#99907c] hover:text-[#e3e2e5]"
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Watchlist</span>
            </Link>
          </nav>
        </div>

        {/* Admin Access / Logout Button */}
        <div className="shrink-0">
          {isAdmin ? (
            <button
              onClick={handleLogoutClick}
              onMouseEnter={() => setIsAuthBtnHovered(true)}
              onMouseLeave={() => setIsAuthBtnHovered(false)}
              className="flex items-center justify-center gap-2 w-9 h-9 sm:w-[130px] sm:h-auto sm:py-2 rounded-lg bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/40 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/40 text-xs font-bold font-headline transition-colors cursor-pointer shrink-0"
              title={isAuthBtnHovered ? "Logout" : "Admin Mode"}
            >
              {isAuthBtnHovered ? (
                <>
                  <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#f2ca50] shrink-0" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => onOpenAdminModal && onOpenAdminModal()}
              onMouseEnter={() => setIsAuthBtnHovered(true)}
              onMouseLeave={() => setIsAuthBtnHovered(false)}
              className="flex items-center justify-center gap-2 w-9 h-9 sm:w-[130px] sm:h-auto sm:py-2 rounded-lg bg-[#1b1c1e] hover:bg-[#292a2c] text-[#c6c6c9] hover:text-[#e3e2e5] border border-[#292a2c] text-xs font-semibold font-headline transition-colors cursor-pointer shrink-0"
              title={isAuthBtnHovered ? "Login" : "Admin Access"}
            >
              {isAuthBtnHovered ? (
                <>
                  <LogIn className="w-3.5 h-3.5 text-[#f2ca50] shrink-0" />
                  <span className="hidden sm:inline">Login</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Admin Access</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
