"use client";

import Link from "next/link";
import { HouseSimple } from "@phosphor-icons/react";
import SidebarItem from "../SidebarItem/SidebarItem";

export default function Sidebar() {
  return (
    <aside className="w-fit h-full z-10">
      <nav className="w-fit h-full flex flex-col justify-between py-4 px-3 rounded-full bg-white dark:bg-[#1A1D23] items-center">
        <div className="w-fit h-13 border-b border-[#e6e6e6] dark:border-[#7c7c7c]">
            <Link href="/" className="w-10 h-10 flex justify-center items-center font-bold">G</Link>
        </div>
        
        <div className="flex flex-col gap-3">
          <SidebarItem href="/home" icon={HouseSimple} />
          <SidebarItem href="/Catalog" icon={HouseSimple} />
        </div>
        
        <p>a</p>
      </nav>
    </aside>
  );
}