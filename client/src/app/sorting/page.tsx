import { getMobilesData } from "@/services/mobiles.services";
import SortingView from "@/components/sorting/SortingView";

interface PageProps {
    searchParams: Promise<{
        search?: string
        sort?: string,
        brand?: string,
        ram?: string,
        page?: string,
        limit?: string,
    }>
}

const SortingPage = async ({ searchParams }: PageProps) => {
    const params = await searchParams;

    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const mobiles = await getMobilesData(queryString);
    console.log(mobiles, 'mobiles');

    return <SortingView mobilesData={mobiles} params={params} />;
};

export default SortingPage;
