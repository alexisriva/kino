import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#292a2c] bg-[#0d0e10] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#99907c] font-label">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="KINO Logo"
            className="h-6 w-auto object-contain"
          />
          <span className="font-headline font-extrabold text-[#f2ca50] text-lg tracking-tight">
            KINO
          </span>
          <span>— Personal Movies & Series Journal</span>
        </div>
        <p className="text-center sm:text-right">
          Alexis Rivadeneira © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
