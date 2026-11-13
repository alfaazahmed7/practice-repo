import Link from "next/link";

interface ParamsProps {
    params: {
        search?: string;
        sort?: string;
        brand?: string;
        ram?: string;
        page?: string;
        limit?: string;
    },
    pagination: {
        currentPage: number,
        limit: number,
        totalMobiles: number,
        totalPages: number
    }
}

export default function MobilePagination({ params, pagination }: ParamsProps) {
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return null;

    const createPageUrl = (page: number) => {
        const newParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value && key !== 'page') newParams.set(key, value);
        });

        newParams.set('page', page.toString());
        return `?${newParams.toString()}`;
    }

    return (
        <nav className="flex items-center justify-center gap-2">

            {currentPage === 1 ? (
                <span
                    aria-disabled='true'
                    className="cursor-not-allowed select-none rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-purple-100/70 transition hover:border-fuchsia-300/40 hover:text-white">
                    Prev
                </span>
            ) : (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-purple-100/70 transition hover:border-fuchsia-300/40 hover:text-white"
                >
                    Prev
                </Link>
            )}

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Link
                    key={page}
                    href={createPageUrl(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${page === currentPage
                        ? "border border-fuchsia-300/40 bg-fuchsia-400/10 text-fuchsia-200"
                        : "border border-white/10 bg-white/5 text-purple-100/70 hover:border-fuchsia-300/40 hover:text-white"
                        }`}
                >
                    {page}
                </Link>
            ))}

            {currentPage === totalPages ? (
                <span
                    aria-disabled='true'
                    className="cursor-not-allowed select-none rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-purple-100/70 transition hover:border-fuchsia-300/40 hover:text-white">
                    Next
                </span>
            ) : (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-purple-100/70 transition hover:border-fuchsia-300/40 hover:text-white"
                >
                    Next
                </Link>
            )}
        </nav>
    );
}