import Link from "next/link";
import { Film, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-[#f2ca50] selection:text-[#121315]">
      <div className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
        {/* Icon */}
        <div className="p-4 rounded-full bg-[#1b1c1e] border border-[#292a2c] shadow-lg">
          <Film className="w-12 h-12 text-[#99907c]" />
        </div>

        {/* Headlines */}
        <div className="space-y-2">
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-[#e3e2e5]">
            404
          </h1>
          <h2 className="font-headline text-xl md:text-2xl font-bold text-[#c6c6c9]">
            Scene Not Found
          </h2>
        </div>

        {/* Editorial Body Text */}
        <p className="font-journal text-lg text-[#d0c5af] leading-relaxed italic">
          "The footage you are looking for has been left on the cutting room floor. It may have been moved, deleted, or never existed in the final cut."
        </p>

        {/* Action Button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
