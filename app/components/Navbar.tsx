import { Brain, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[rgba(91,155,213,0.15)]">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div>
                            <h1 className="text-xl font-semibold text-[#2C3E50]">Project M</h1>
                            <p className="text-xs text-[#6B7280]">AI-Powered Study Timer</p>
                        </div>
                    </Link>

                    <Link
                        href="/session"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E3F2FD] text-[#5B9BD5] hover:bg-[#5B9BD5] hover:text-white transition-all duration-200"
                    >
                        <span>Study Time</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
