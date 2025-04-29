// components/navbar.tsx
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DollarSign } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? "font-bold text-primary" : "text-muted-foreground";
  };
  
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FinTrack</span>
        </div>
        
        <nav className="flex items-center space-x-6 ml-6">
          <Link href="/" className={`text-sm ${isActive("/")}`}>
            Dashboard
          </Link>
          <Link href="/transactions" className={`text-sm ${isActive("/transactions")}`}>
            Transactions
          </Link>
        </nav>
      </div>
    </header>
  );
}