import { Request, Response } from "express"
import Mobile from "../models/Mobile.js"

export const getMobiles = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { search, sort, brand, ram } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(20, Number(req.query.limit) || 8);

        const skip = (page - 1) * limit;

        // query object
        const query: Record<string, unknown> = {};

        // search 
        if (search) {
            query.$or = [
                { brand: { $regex: search, $options: 'i' } },
                { processor: { $regex: search, $options: 'i' } },
                { display: { $regex: search, $options: 'i' } }
            ]
        }

        // sort
        let sortOption = {};

        if (sort === 'price-asc') {
            sortOption = { price: 1 };
        }
        else if (sort === 'price-desc') {
            sortOption = { price: -1 };
        }
        else if (sort === 'rating-desc') {
            sortOption = { rating: -1 };
        }
        else if (sort === 'newest') {
            sortOption = { releaseYear: -1 }
        }

        // brand filtering
        if (brand) {
            query.brand = { $in: [brand] }
        }

        if (ram) {
            query.ram = { $in: [ram] }
        }

        const mobiles = await Mobile.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        // if (mobiles.length === 0) {
        //     res.status(404).json({
        //         message: 'No mobiles data has been found'
        //     });
        // }

        // get total number of mobiles
        const totalMobiles = await Mobile.countDocuments();

        // calculate total pages
        const totalPages = Math.ceil(totalMobiles / limit);

        res.status(200).json({
            success: true,
            total: mobiles.length,
            mobiles,
            pagination: {
                currentPage: page,
                limit,
                totalMobiles,
                totalPages
            }
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch mobiles data'
        });
    }
}

// notes:
// 1. Math.max(1, ...) prevents page numbers below 1.
// 2. The Math.min(50, ...) prevents someone from requesting an excessively large number of products per page.