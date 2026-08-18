"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconProps } from "@phosphor-icons/react";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
}

export default function SidebarItem({ href, icon: Icon }: SidebarItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link 
      href={href} 
      className={`w-10 h-10 flex justify-center items-center rounded-full transition-colors ${
        active ? "bg-[#E3F2FD] dark:bg-[#1976D2]" : "hover:bg-[#f6f6f6] dark:hover:bg-[#7c7c7c]"
      }`}
    >
      <Icon 
        size={16} 
        weight={active ? "fill" : "bold"} 
        className={active 
            ? "text-[#1976D2] dark:text-[#E3F2FD]" 
            : "text-[#000000] dark:text-[#ffffff]" 
        }
      />
    </Link>
  );
}