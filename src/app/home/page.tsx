'use client'

import Link from "next/link";
import { HouseSimpleIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar/Sidebar";
import FriendPanel from "../components/FriendPanel/FriendPanel";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
    const pathname = usePathname();
    const router = useRouter();
    
    const rootRef = useRef<HTMLDivElement>(null);
    const activeColumn = useRef(1); 
    const focusedIndices = useRef([0, 0, 0]); 
    
    const stickNeutral = useRef({ x: true, y: true });
    const lastActionTime = useRef(0);

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        let requestRef: number;

        const getFocusables = (colIndex: number) => {
            if (!rootRef.current) return [];
            const columnElement = rootRef.current.children[colIndex] as HTMLElement;
            if (!columnElement) return [];
            return Array.from(columnElement.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')) as HTMLElement[];
        };

        const updateFocus = (colIndex: number, resetToActive = false) => {
            const focusables = getFocusables(colIndex);
            if (focusables.length === 0) return;

            let targetIndex = focusedIndices.current[colIndex];

            if (colIndex === 0 && resetToActive) {
                const activeIndex = focusables.findIndex(el => (el as HTMLAnchorElement).href?.includes(pathname));
                if (activeIndex !== -1) targetIndex = activeIndex;
            }
            
            if (colIndex === 1 && resetToActive) {
                const firstCardIndex = focusables.findIndex(el => el.tagName === 'A');
                targetIndex = firstCardIndex !== -1 ? firstCardIndex : 0;
            }

            if (targetIndex >= focusables.length) targetIndex = focusables.length - 1;
            if (targetIndex < 0) targetIndex = 0;

            focusedIndices.current[colIndex] = targetIndex;
            
            const targetEl = focusables[targetIndex];
            targetEl.focus({ preventScroll: true });
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        const handleGamepad = () => {
            const pad = navigator.getGamepads()[0];
            if (!pad) return;

            const now = performance.now();
            const axisX = pad.axes[0]; 
            const axisY = pad.axes[1]; 
            const deadzone = 0.4;

            if (now - lastActionTime.current > 300) {
                if (pad.buttons[1].value > 0.5) {
                    const activeEl = document.activeElement as HTMLElement;
                    if (activeEl && typeof activeEl.click === 'function') activeEl.click();
                    lastActionTime.current = now;
                }
                if (pad.buttons[0].value > 0.5) {
                    router.back();
                    lastActionTime.current = now;
                }
            }

            if (Math.abs(axisX) > deadzone) {
                if (stickNeutral.current.x) {
                    if (axisX > 0 && activeColumn.current < 2) {
                        activeColumn.current += 1;
                        updateFocus(activeColumn.current, true);
                    } else if (axisX < 0 && activeColumn.current > 0) {
                        activeColumn.current -= 1;
                        updateFocus(activeColumn.current, true);
                    }
                    stickNeutral.current.x = false;
                }
            } else {
                stickNeutral.current.x = true;
            }

            if (Math.abs(axisY) > deadzone) {
                if (stickNeutral.current.y) {
                    const colIndex = activeColumn.current;
                    const focusables = getFocusables(colIndex);
                    
                    if (focusables.length > 0) {
                        if (axisY > 0) {
                            focusedIndices.current[colIndex] = Math.min(focusedIndices.current[colIndex] + 1, focusables.length - 1);
                        } else if (axisY < 0) {
                            focusedIndices.current[colIndex] = Math.max(focusedIndices.current[colIndex] - 1, 0);
                        }
                        updateFocus(colIndex, false);
                    }
                    stickNeutral.current.y = false;
                }
            } else {
                stickNeutral.current.y = true;
            }
        };

        const loop = () => {
            handleGamepad();
            requestRef = requestAnimationFrame(loop);
        };

        setTimeout(() => updateFocus(1, true), 100); 
        requestRef = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(requestRef);
    }, [pathname, router]);

    return(
        <div ref={rootRef} className="relative flex h-screen overflow-hidden p-4 gap-8">
            <div 
                className="absolute -z-10 top-0 left-0 w-full h-160 bg-[url('/games/game-icon/fastcar-banner2.png')] bg-cover bg-center shadow-[inset_0_-100px_80px_-20px_var(--background)]"
            ></div>
            
            <Sidebar />

            <div className="z-10 flex-1 flex flex-col min-w-0 gap-120 overflow-y-auto">
                <header className="h-fit py-4 flex justify-center">
                    <input type="search" placeholder="Cari sesuatu..." className="bg-white dark:bg-[#1A1D23] py-3 px-4 w-120 rounded-full text-base" />
                </header>
                <main className="flex-1 flex-col gap-8">
                    <div className="w-full h-fit flex flex-col gap-4">
                        <h2 className="text-lg font-semibold">Permainan</h2>
                        <div className="w-full h-fit flex flex-row gap-4">
                            {/* Konversi ke tag Link bawaan Next.js tanpa event handler eksternal */}
                            <Link 
                                href="/games/fastcar"
                                className="cursor-pointer w-80 aspect-[4/3] bg-white dark:bg-[#1A1D23] rounded-[20px] flex flex-col overflow-hidden outline-none focus:ring-4 focus:ring-blue-500 transition-shadow"
                            >
                                <div 
                                    className="w-full h-full bg-gray-800 bg-cover bg-center p-4"
                                    style={{ backgroundImage: "url('/games/game-icon/fastcar-banner2.png')" }}
                                >
                                    <span className="w-fit h-fit py-2 px-3 text-xs bg-white dark:bg-[#1A1D23] rounded-full font-semibold">Solo</span>
                                </div>
                                <div className="w-full h-fit flex flex-row p-4 gap-7 items-center">
                                    <div className="w-full h-fit flex flex-row gap-4 items-center">
                                        <div className="w-10 h-10 rounded-[8px] bg-gray-800 overflow-hidden">
                                        <Image
                                            loading="lazy"
                                            width={100}
                                            height={100}
                                            src='/games/game-icon/fastcar-icon.png'
                                            alt="Ikon permainan fast car"
                                            className="w-full h-full object-cover" 
                                        />
                                        </div>
                                        <div className="flex-1 h-fit flex flex-col justify-left gap-[6]">
                                            <h3 className="text-base font-semibold leading-none">Fast Car</h3>
                                            <p className="text-sm leading-none">Balapan</p>
                                        </div>
                                    </div>
                                    <span className="w-fit h-fit py-2 px-3 text-xs dark:bg-[#1976D2] bg-[#E3F2FD] dark:text-[#E3F2FD] text-[#1976D2] rounded-full font-semibold">Mainkan</span>
                                </div>
                            </Link>
                            <Link 
                                href="/games/citybuilder"
                                className="cursor-pointer w-80 aspect-[4/3] bg-white dark:bg-[#1A1D23] rounded-[20px] flex flex-col overflow-hidden outline-none focus:ring-4 focus:ring-blue-500 transition-shadow"
                            >
                                <div 
                                    className="w-full h-full bg-gray-800 bg-cover bg-center p-4"
                                    style={{ backgroundImage: "url('')" }}
                                >
                                    <span className="w-fit h-fit py-2 px-3 text-xs bg-white dark:bg-[#1A1D23] rounded-full font-semibold">Solo</span>
                                </div>
                                <div className="w-full h-fit flex flex-row p-4 gap-7 items-center">
                                    <div className="w-full h-fit flex flex-row gap-4 items-center">
                                        <div className="w-10 h-10 rounded-[8px] bg-gray-800 overflow-hidden">
                                        <Image
                                            loading="lazy"
                                            width={100}
                                            height={100}
                                            src=''
                                            alt="Ikon permainan fast car"
                                            className="w-full h-full object-cover" 
                                        />
                                        </div>
                                        <div className="flex-1 h-fit flex flex-col justify-left gap-[6]">
                                            <h3 className="text-base font-semibold leading-none">City Builder</h3>
                                            <p className="text-sm leading-none">Balapan</p>
                                        </div>
                                    </div>
                                    <span className="w-fit h-fit py-2 px-3 text-xs dark:bg-[#1976D2] bg-[#E3F2FD] dark:text-[#E3F2FD] text-[#1976D2] rounded-full font-semibold">Mainkan</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>

            <FriendPanel />
        </div>
    )
}