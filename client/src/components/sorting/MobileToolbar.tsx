'use client'

import { Mobile } from "@/types/Mobile";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

interface MobileProps {
    initialMobiles: Mobile[]
}

export default function MobileToolbar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeSearch = searchParams.get('search') || '';
    const activeSort = searchParams.get('sort') || '';
    const activeBrand = searchParams.get('brand') || '';
    const activeRam = searchParams.get('ram') || '';

    const updateQuery = (key: string, value: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (!value || value === 'all') {
            current.delete(key);
        }
        else {
            current.set(key, value);
        }

        router.push(`/sorting?${current.toString()}`);
    }

    const handleReset = () => {
        router.push('/sorting');
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-sm">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/50" />
                    <input
                        type="text"
                        placeholder="Search mobiles..."
                        value={activeSearch}
                        onChange={(e) => updateQuery('search', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-purple-200/50 focus:border-fuchsia-300/40"
                    />
                </div>

                {/* Sort + Filter */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={activeSort}
                        onChange={(e) => updateQuery('sort', e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-purple-100 outline-none transition focus:border-fuchsia-300/40">
                        <div className="bg-black text-gray-900">
                            <option value=''>All Sort</option>
                            <option value='price-asc'>Price: Low to High</option>
                            <option value='price-desc'>Price: High to Low</option>
                            <option value='rating-desc'>Rating: High to Low</option>
                            <option value='newest'>Newest First</option>
                        </div>
                    </select>

                    <select
                        value={activeBrand}
                        onChange={(e) => updateQuery('brand', e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-purple-100 outline-none transition focus:border-fuchsia-300/40">
                        <div className="bg-black text-gray-900">
                            <option value='all'>All Brand</option>
                            <option value='Samsung'>Samsung</option>
                            <option value='Oppo'>Oppo</option>
                            <option value='Apple'>Apple</option>
                            <option value='Tecno'>Tecno</option>
                            <option value='Google'>Google</option>
                            <option value='Realme'>Realme</option>
                            <option value='OnePlus'>OnePlus</option>
                            <option value='Xiaomi'>Xiaomi</option>
                            <option value='Vivo'>Vivo</option>
                            <option value='Honor'>Honor</option>
                            <option value='Motorola'>Motorola</option>
                        </div>
                    </select>

                    <select
                        value={activeRam}
                        onChange={(e) => updateQuery('ram', e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-purple-100 outline-none transition focus:border-fuchsia-300/40">
                        <div className="bg-black text-gray-900">
                            <option value='all'>All Ram</option>
                            <option value='4 GB'>4 GB</option>
                            <option value='6 GB'>6 GB</option>
                            <option value='8 GB'>8 GB</option>
                            <option value='12 GB'>12 GB</option>
                            <option value='16 GB'>16 GB</option>
                        </div>
                    </select>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-300/40 bg-fuchsia-400/10 px-4 py-2.5 text-sm font-medium text-fuchsia-200 transition hover:bg-fuchsia-400/20"
                    >
                        <FiRefreshCw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
