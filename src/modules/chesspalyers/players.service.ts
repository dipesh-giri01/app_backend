import BaseService from "../../services/baseService";
import { IPlayer } from "./players.model";
import PlayerModel from "./players.model";
import { BadRequestError } from "../../errors/BadRequestError.error";
import { NotFoundError } from "../../errors/NotFoundError.error";

interface PaginationParams {
    page: number;
    size: number;
}

interface SearchResponse {
    data: any[];
    pagination: {
        page: number;
        size: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

class PlayersService extends BaseService<IPlayer> {
    /**
     * Validate and normalize pagination parameters
     */
    private validatePagination(page?: any, size?: any): PaginationParams {
        const pageNum = Math.max(0, parseInt(String(page)) || 0);
        const sizeNum = Math.min(100, Math.max(1, parseInt(String(size)) || 20));

        return { page: pageNum, size: sizeNum };
    }

    /**
     * Get single player by ID
     */
    async getPlayerById(id_number: string): Promise<IPlayer> {
        if (!id_number || id_number.trim() === "") {
            throw new BadRequestError("Player ID is required");
        }

        const player = await this.singleRow({ id_number: id_number.trim() });

        if (!player) {
            throw new NotFoundError(`Player with ID ${id_number} not found`);
        }

        return player;
    }

    /**
     * Search player by FIDE ID (exact match)
     */
    async searchByFideId(id_number: string): Promise<IPlayer> {
        if (!id_number || id_number === "") {
            throw new BadRequestError("FIDE ID query parameter is required");
        }

        const player = await this.singleRow({
            id_number: String(id_number).trim()
        });

        if (!player) {
            throw new NotFoundError(`No player found with FIDE ID ${id_number}`);
        }

        return player;
    }

    /**
     * Search players by name (case-insensitive partial match)
     */
    async searchByName(
        name: string,
        page?: any,
        size?: any
    ): Promise<SearchResponse> {
        if (!name || name === "") {
            throw new BadRequestError("Search name is required");
        }

        const { page: pageNum, size: sizeNum } = this.validatePagination(page, size);

        const filter = {
            name: { $regex: String(name), $options: "i" }
        };

        const result = await this.getRows(filter, pageNum + 1, sizeNum);

        return {
            data: result.data,
            pagination: {
                page: pageNum,
                size: sizeNum,
                totalItems: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: pageNum > 0
            }
        };
    }

    /**
     * Advanced search with multiple filters
     */
    async advancedSearch(
        filters: {
            federation?: string;
            sex?: string;
            title?: string;
            minRating?: string;
            maxRating?: string;
            hasTitle?: string;
        },
        page?: any,
        size?: any
    ): Promise<SearchResponse> {
        const { page: pageNum, size: sizeNum } = this.validatePagination(page, size);

        // Build filter
        const filter: any = {};

        if (filters.federation) {
            filter.federation = String(filters.federation).toUpperCase();
        }

        if (filters.sex) {
            if (!["M", "F"].includes(String(filters.sex))) {
                throw new BadRequestError("Sex must be 'M' or 'F'");
            }
            filter.sex = String(filters.sex);
        }

        if (filters.title) {
            filter.title = { $in: [String(filters.title)] };
        }

        if (filters.hasTitle === "true") {
            filter.title = { $exists: true, $ne: [] };
        }

        // Rating filter
        if (filters.minRating || filters.maxRating) {
            filter.standard_rating = {};
            if (filters.minRating) {
                const minVal = parseInt(String(filters.minRating));
                if (isNaN(minVal)) {
                    throw new BadRequestError("minRating must be a valid number");
                }
                filter.standard_rating.$gte = minVal;
            }
            if (filters.maxRating) {
                const maxVal = parseInt(String(filters.maxRating));
                if (isNaN(maxVal)) {
                    throw new BadRequestError("maxRating must be a valid number");
                }
                filter.standard_rating.$lte = maxVal;
            }
        }

        const result = await this.getRows(filter, pageNum + 1, sizeNum);

        return {
            data: result.data,
            pagination: {
                page: pageNum,
                size: sizeNum,
                totalItems: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: pageNum > 0
            }
        };
    }

    /**
     * Get rankings by standard rating
     */
    async getRankingsStandard(
        gender?: string,
        federation?: string,
        page?: any,
        size?: any,
        includeInactive: boolean = false
    ): Promise<SearchResponse> {
        const { page: pageNum, size: sizeNum } = this.validatePagination(page, size);

        const filter: any = {};

        if (gender) {
            if (!["M", "F"].includes(String(gender))) {
                throw new BadRequestError("Gender must be 'M' or 'F'");
            }
            filter.sex = String(gender);
        }

        if (federation) {
            filter.federation = String(federation).toUpperCase();
        }

        // Exclude inactive players unless specified
        if (!includeInactive) {
            filter.flag = { $in: [null, "", "w"] }; // Only include active flags: null, empty, or "w" (woman)
        }

        const result = await this.getRows(
            filter,
            pageNum + 1,
            sizeNum,
            { sort: { standard_rating: -1 } }
        );

        const dataWithRank = this.addRankToPlayers(result.data, pageNum, sizeNum);

        return {
            data: dataWithRank,
            pagination: {
                page: pageNum,
                size: sizeNum,
                totalItems: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: pageNum > 0
            }
        };
    }

    /**
     * Get rankings by rapid rating
     */
    async getRankingsRapid(
        gender?: string,
        federation?: string,
        page?: any,
        size?: any,
        includeInactive: boolean = false
    ): Promise<SearchResponse> {
        const { page: pageNum, size: sizeNum } = this.validatePagination(page, size);

        const filter: any = {};

        if (gender) {
            if (!["M", "F"].includes(String(gender))) {
                throw new BadRequestError("Gender must be 'M' or 'F'");
            }
            filter.sex = String(gender);
        }

        if (federation) {
            filter.federation = String(federation).toUpperCase();
        }

        // Exclude inactive players unless specified
        if (!includeInactive) {
            filter.flag = { $in: [null, "", "w"] }; // Only include active flags
        }

        const result = await this.getRows(
            filter,
            pageNum + 1,
            sizeNum,
            { sort: { rapid_rating: -1 } }
        );

        const dataWithRank = this.addRankToPlayers(result.data, pageNum, sizeNum);

        return {
            data: dataWithRank,
            pagination: {
                page: pageNum,
                size: sizeNum,
                totalItems: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: pageNum > 0
            }
        };
    }

    /**
     * Get rankings by blitz rating
     */
    async getRankingsBlitz(
        gender?: string,
        federation?: string,
        page?: any,
        size?: any,
        includeInactive: boolean = false
    ): Promise<SearchResponse> {
        const { page: pageNum, size: sizeNum } = this.validatePagination(page, size);

        const filter: any = {};

        if (gender) {
            if (!["M", "F"].includes(String(gender))) {
                throw new BadRequestError("Gender must be 'M' or 'F'");
            }
            filter.sex = String(gender);
        }

        if (federation) {
            filter.federation = String(federation).toUpperCase();
        }

        // Exclude inactive players unless specified
        if (!includeInactive) {
            filter.flag = { $in: [null, "", "w"] }; // Only include active flags
        }

        const result = await this.getRows(
            filter,
            pageNum + 1,
            sizeNum,
            { sort: { blitz_rating: -1 } }
        );

        const dataWithRank = this.addRankToPlayers(result.data, pageNum, sizeNum);

        return {
            data: dataWithRank,
            pagination: {
                page: pageNum,
                size: sizeNum,
                totalItems: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: pageNum > 0
            }
        };
    }

    /**
     * Get rankings by age group
     */
    async getRankingsByAgeGroup(
        groupCode: string,
        gender?: string,
        ratingType?: string,
        page?: any,
        size?: any
    ): Promise<SearchResponse & { groupCode: string }> {
        const validGroupCodes = ["U8", "U10", "U12", "U14", "U16", "U18", "S20", "S40", "S50", "S60", "S70"];

        if (!validGroupCodes.includes(groupCode)) {
            throw new BadRequestError(
                `Invalid age group code. Allowed: ${validGroupCodes.join(", ")}`
            );
        }

        const { page: pageNum, size: sizeNum } = this.validatePagination(page, size);

        // Calculate age range
        const currentYear = new Date().getFullYear();
        const ageGroupRanges: { [key: string]: [number, number] } = {
            "U8": [currentYear - 8, currentYear],
            "U10": [currentYear - 10, currentYear],
            "U12": [currentYear - 12, currentYear],
            "U14": [currentYear - 14, currentYear],
            "U16": [currentYear - 16, currentYear],
            "U18": [currentYear - 18, currentYear],
            "U20": [currentYear - 19, currentYear],
            "S50": [currentYear - 59, currentYear - 50],
            "S60": [currentYear - 69, currentYear - 60],
            "S70": [currentYear - 79, currentYear - 70]
        };

        const [minBirth, maxBirth] = ageGroupRanges[groupCode];

        const filter: any = {
            birthday: { $gte: String(minBirth), $lte: String(maxBirth) }
        };

        if (gender) {
            if (!["M", "F"].includes(String(gender))) {
                throw new BadRequestError("Gender must be 'M' or 'F'");
            }
            filter.sex = String(gender);
        }

        // Validate rating type
        const validRatingTypes = ["standard", "rapid", "blitz"];
        const ratingTypeToUse = validRatingTypes.includes(String(ratingType))
            ? String(ratingType)
            : "standard";

        const ratingField = `${ratingTypeToUse}_rating`;

        const result = await this.getRows(
            filter,
            pageNum + 1,
            sizeNum,
            { sort: { [ratingField]: -1 } }
        );

        // Add rank and age to each player
        const dataWithRankAndAge = result.data.map((player: any, index: number) => {
            const birthYear = parseInt(String(player.birthday) || "1900");
            const age = currentYear - birthYear;
            return {
                ...player.toObject?.() || player,
                rank: (pageNum * sizeNum) + index + 1,
                age
            };
        });

        return {
            data: dataWithRankAndAge,
            pagination: {
                page: pageNum,
                size: sizeNum,
                totalItems: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: pageNum > 0
            },
            groupCode
        };
    }

    /**
     * Get players by federation
     */
    async getPlayersByFederation(
        federation: string,
        sortBy?: string,
        gender?: string,
        page?: any,
        size?: any
    ): Promise<SearchResponse & { federation: string }> {
        if (!federation || federation.trim() === "") {
            throw new BadRequestError("Federation code is required");
        }

        const { page: pageNum, size: sizeNum } = this.validatePagination(page, size);

        const validSortBy = ["standard", "rapid", "blitz"];
        const sortField = validSortBy.includes(String(sortBy))
            ? `${String(sortBy)}_rating`
            : "standard_rating";

        const filter: any = { federation: String(federation).toUpperCase() };

        if (gender) {
            if (!["M", "F"].includes(String(gender))) {
                throw new BadRequestError("Gender must be 'M' or 'F'");
            }
            filter.sex = String(gender);
        }

        const result = await this.getRows(
            filter,
            pageNum + 1,
            sizeNum,
            { sort: { [sortField]: -1 } }
        );

        return {
            data: result.data,
            pagination: {
                page: pageNum,
                size: sizeNum,
                totalItems: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: pageNum > 0
            },
            federation: String(federation).toUpperCase()
        };
    }

    /**
      * Get database statistics
     */
    async getPlayerStats(includeInactive: boolean = false): Promise<any> {
        const currentYear = new Date().getFullYear();

        const stats = await PlayerModel.aggregate([
            {
                $match: includeInactive ? {} : { flag: { $in: [null, "", "w"] } }
            },
            {
                $facet: {
                    totalPlayers: [{ $count: "count" }],
                    activePlayers: [
                        { $match: { flag: { $in: [null, "", "w"] } } },
                        { $count: "count" }
                    ],
                    inactivePlayers: [
                        { $match: { flag: { $in: ["i", "wi"] } } },
                        { $count: "count" }
                    ],
                    byGender: [
                        { $group: { _id: "$sex", count: { $sum: 1 } } }
                    ],
                    byFederation: [
                        { $group: { _id: "$federation", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 20 }
                    ],
                    averageRatings: [
                        {
                            $group: {
                                _id: null,
                                avgStandard: {
                                    $avg: {
                                        $cond: [{ $gt: ["$standard_rating", 0] }, "$standard_rating", null]
                                    }
                                },
                                avgRapid: {
                                    $avg: {
                                        $cond: [{ $gt: ["$rapid_rating", 0] }, "$rapid_rating", null]
                                    }
                                },
                                avgBlitz: {
                                    $avg: {
                                        $cond: [{ $gt: ["$blitz_rating", 0] }, "$blitz_rating", null]
                                    }
                                }
                            }
                        }
                    ],
                    ratingDistribution: [
                        {
                            $group: {
                                _id: null,
                                allThreeRatings: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gt: ["$standard_rating", 0] },
                                                    { $gt: ["$rapid_rating", 0] },
                                                    { $gt: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                standardAndRapidOnly: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gt: ["$standard_rating", 0] },
                                                    { $gt: ["$rapid_rating", 0] },
                                                    { $eq: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                rapidAndBlitzOnly: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$standard_rating", 0] },
                                                    { $gt: ["$rapid_rating", 0] },
                                                    { $gt: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                blitzAndStandardOnly: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gt: ["$standard_rating", 0] },
                                                    { $eq: ["$rapid_rating", 0] },
                                                    { $gt: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                standardOnly: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gt: ["$standard_rating", 0] },
                                                    { $eq: ["$rapid_rating", 0] },
                                                    { $eq: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                rapidOnly: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$standard_rating", 0] },
                                                    { $gt: ["$rapid_rating", 0] },
                                                    { $eq: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                blitzOnly: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$standard_rating", 0] },
                                                    { $eq: ["$rapid_rating", 0] },
                                                    { $gt: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                unrated: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$standard_rating", 0] },
                                                    { $eq: ["$rapid_rating", 0] },
                                                    { $eq: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                playersWithAtLeastOneRating: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $or: [
                                                    { $gt: ["$standard_rating", 0] },
                                                    { $gt: ["$rapid_rating", 0] },
                                                    { $gt: ["$blitz_rating", 0] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    titledPlayers: [
                        { $match: { title: { $ne: [] } } },
                        { $count: "count" }
                    ],
                    titleDistribution: [
                        { $match: { title: { $ne: [] } } },
                        { $unwind: "$title" },
                        {
                            $group: {
                                _id: "$title",
                                count: { $sum: 1 },
                                males: {
                                    $sum: {
                                        $cond: [{ $eq: ["$sex", "M"] }, 1, 0]
                                    }
                                },
                                females: {
                                    $sum: {
                                        $cond: [{ $eq: ["$sex", "F"] }, 1, 0]
                                    }
                                }
                            }
                        },
                        { $sort: { count: -1 } }
                    ],
                    womenTitles: [
                        {
                            $match: {
                                $and: [
                                    { title: { $ne: [] } },
                                    { sex: "F" }
                                ]
                            }
                        },
                        { $count: "count" }
                    ],
                    menTitles: [
                        {
                            $match: {
                                $and: [
                                    { title: { $ne: [] } },
                                    { sex: "M" }
                                ]
                            }
                        },
                        { $count: "count" }
                    ],
                    ageGroupDistribution: [
                        {
                            $addFields: {
                                birthYear: { $toInt: "$birthday" },
                                age: { $subtract: [currentYear, { $toInt: "$birthday" }] }
                            }
                        },
                        {
                            $bucket: {
                                groupBy: "$age",
                                boundaries: [0, 8, 10, 12, 14, 16, 18, 20, 21, 30, 40, 50, 60, 70, 80, 120],
                                default: "unknown",
                                output: {
                                    count: { $sum: 1 },
                                    avgStandard: {
                                        $avg: {
                                            $cond: [{ $gt: ["$standard_rating", 0] }, "$standard_rating", null]
                                        }
                                    },
                                    avgRapid: {
                                        $avg: {
                                            $cond: [{ $gt: ["$rapid_rating", 0] }, "$rapid_rating", null]
                                        }
                                    },
                                    avgBlitz: {
                                        $avg: {
                                            $cond: [{ $gt: ["$blitz_rating", 0] }, "$blitz_rating", null]
                                        }
                                    },
                                    ratedPlayers: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $or: [
                                                        { $gt: ["$standard_rating", 0] },
                                                        { $gt: ["$rapid_rating", 0] },
                                                        { $gt: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    unratedPlayers: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$standard_rating", 0] },
                                                        { $eq: ["$rapid_rating", 0] },
                                                        { $eq: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    allThreeRatings: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $gt: ["$standard_rating", 0] },
                                                        { $gt: ["$rapid_rating", 0] },
                                                        { $gt: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    standardOnly: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $gt: ["$standard_rating", 0] },
                                                        { $eq: ["$rapid_rating", 0] },
                                                        { $eq: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    rapidOnly: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$standard_rating", 0] },
                                                        { $gt: ["$rapid_rating", 0] },
                                                        { $eq: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    blitzOnly: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$standard_rating", 0] },
                                                        { $eq: ["$rapid_rating", 0] },
                                                        { $gt: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    standardAndRapidOnly: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $gt: ["$standard_rating", 0] },
                                                        { $gt: ["$rapid_rating", 0] },
                                                        { $eq: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    rapidAndBlitzOnly: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$standard_rating", 0] },
                                                        { $gt: ["$rapid_rating", 0] },
                                                        { $gt: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    blitzAndStandardOnly: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $gt: ["$standard_rating", 0] },
                                                        { $eq: ["$rapid_rating", 0] },
                                                        { $gt: ["$blitz_rating", 0] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    maleTotal: {
                                        $sum: {
                                            $cond: [{ $eq: ["$sex", "M"] }, 1, 0]
                                        }
                                    },
                                    femaleTotal: {
                                        $sum: {
                                            $cond: [{ $eq: ["$sex", "F"] }, 1, 0]
                                        }
                                    },
                                    maleRated: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$sex", "M"] },
                                                        {
                                                            $or: [
                                                                { $gt: ["$standard_rating", 0] },
                                                                { $gt: ["$rapid_rating", 0] },
                                                                { $gt: ["$blitz_rating", 0] }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    femaleRated: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$sex", "F"] },
                                                        {
                                                            $or: [
                                                                { $gt: ["$standard_rating", 0] },
                                                                { $gt: ["$rapid_rating", 0] },
                                                                { $gt: ["$blitz_rating", 0] }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const ratingDist = stats[0].ratingDistribution[0] || {};
        const ageGroups = stats[0].ageGroupDistribution || [];
        const titleDistribution = stats[0].titleDistribution || [];

        return {
            totalPlayers: stats[0].totalPlayers[0]?.count || 0,
            activePlayers: stats[0].activePlayers[0]?.count || 0,
            inactivePlayers: stats[0].inactivePlayers[0]?.count || 0,
            byGender: stats[0].byGender,
            byFederation: stats[0].byFederation,
            averageRatings: {
                standard: stats[0].averageRatings[0]?.avgStandard ? Math.round(stats[0].averageRatings[0].avgStandard * 100) / 100 : null,
                rapid: stats[0].averageRatings[0]?.avgRapid ? Math.round(stats[0].averageRatings[0].avgRapid * 100) / 100 : null,
                blitz: stats[0].averageRatings[0]?.avgBlitz ? Math.round(stats[0].averageRatings[0].avgBlitz * 100) / 100 : null
            },
            titleStatistics: {
                totalTitledPlayers: stats[0].titledPlayers[0]?.count || 0,
                menWithTitles: stats[0].menTitles[0]?.count || 0,
                womenWithTitles: stats[0].womenTitles[0]?.count || 0,
                titleDistribution: titleDistribution.map((t: any) => ({
                    title: t._id,
                    count: t.count,
                    men: t.males || 0,
                    women: t.females || 0
                }))
            },
            ratingStatistics: {
                playersWithRatings: {
                    allThreeRatings: ratingDist.allThreeRatings || 0,
                    standardAndRapidOnly: ratingDist.standardAndRapidOnly || 0,
                    rapidAndBlitzOnly: ratingDist.rapidAndBlitzOnly || 0,
                    blitzAndStandardOnly: ratingDist.blitzAndStandardOnly || 0,
                    standardOnly: ratingDist.standardOnly || 0,
                    rapidOnly: ratingDist.rapidOnly || 0,
                    blitzOnly: ratingDist.blitzOnly || 0
                },
                playersWithAtLeastOneRating: ratingDist.playersWithAtLeastOneRating || 0,
                unratedPlayers: ratingDist.unrated || 0
            },
            ageGroupDistribution: ageGroups.map((group: any) => ({
                ageGroup: this.getAgeGroupCode(group._id),
                ageRange: this.getAgeRangeForBucket(group._id),
                totalPlayers: group.count,
                ratedPlayers: group.ratedPlayers || 0,
                unratedPlayers: group.unratedPlayers || 0,
                ratingBreakdown: {
                    allThreeRatings: group.allThreeRatings || 0,
                    standardAndRapidOnly: group.standardAndRapidOnly || 0,
                    rapidAndBlitzOnly: group.rapidAndBlitzOnly || 0,
                    blitzAndStandardOnly: group.blitzAndStandardOnly || 0,
                    standardOnly: group.standardOnly || 0,
                    rapidOnly: group.rapidOnly || 0,
                    blitzOnly: group.blitzOnly || 0
                },
                avgRatings: {
                    standard: group.avgStandard ? Math.round(group.avgStandard * 100) / 100 : null,
                    rapid: group.avgRapid ? Math.round(group.avgRapid * 100) / 100 : null,
                    blitz: group.avgBlitz ? Math.round(group.avgBlitz * 100) / 100 : null
                },
                byGender: {
                    male: {
                        totalPlayers: group.maleTotal || 0,
                        ratedPlayers: group.maleRated || 0,
                        unratedPlayers: (group.maleTotal || 0) - (group.maleRated || 0)
                    },
                    female: {
                        totalPlayers: group.femaleTotal || 0,
                        ratedPlayers: group.femaleRated || 0,
                        unratedPlayers: (group.femaleTotal || 0) - (group.femaleRated || 0)
                    }
                }
            }))
        };
    }

    /**
     * Helper: Get age group code from age
     */
    private getAgeGroupCode(age: number): string {
        // FIDE Youth Age Groups
        if (age < 8) return "U-8";
        if (age < 10) return "U-10";
        if (age < 12) return "U-12";
        if (age < 14) return "U-14";
        if (age < 16) return "U-16";
        if (age < 18) return "U-18";
        if (age < 20) return "U-20";
        if (age < 21) return "U-21";
        if (age < 30) return "Junior";
        if (age < 40) return "Adult";
        if (age < 50) return "40+";
        if (age < 60) return "Senior-50+";
        if (age < 70) return "Senior-60+";
        if (age < 80) return "Senior-70+";
        return "Senior-80+";
    }

    /**
     * Helper: Get age range for bucket boundary
     */
    private getAgeRangeForBucket(boundaryAge: number): string {
        // Age buckets: 0, 8, 10, 12, 14, 16, 18, 20, 21, 30, 40, 50, 60, 70, 80, 120
        const ranges: { [key: number]: string } = {
            0: "0-7 years",
            8: "8-9 years",
            10: "10-11 years",
            12: "12-13 years",
            14: "14-15 years",
            16: "16-17 years",
            18: "18-19 years",
            20: "20 years",
            21: "21-29 years",
            30: "30-39 years",
            40: "40-49 years",
            50: "50-59 years",
            60: "60-69 years",
            70: "70-79 years",
            80: "80+ years"
        };
        return ranges[boundaryAge] || `${boundaryAge}+ years`;
    }

    /**
     * Get comprehensive age group statistics
     * Includes: total players, top 10 avg ratings by gender, youngest/oldest players
     */
    async getAgeGroupStats(
        groupCode?: string,
        ratingType: string = "standard",
        gender?: string,
        includeInactive: boolean = false
    ): Promise<any> {
        const validGroupCodes = ["U8", "U10", "U12", "U14", "U16", "U18", "U20", "S40", "S50", "S60", "S70"];
        const validRatingTypes = ["standard", "rapid", "blitz"];

        // Validate gender if provided
        if (gender && !["M", "F"].includes(String(gender))) {
            throw new BadRequestError("Gender must be 'M' or 'F'");
        }

        // If specific group requested, validate it
        if (groupCode && !validGroupCodes.includes(groupCode)) {
            throw new BadRequestError(
                `Invalid age group code. Allowed: ${validGroupCodes.join(", ")}`
            );
        }

        if (!validRatingTypes.includes(ratingType)) {
            throw new BadRequestError(
                `Invalid rating type. Allowed: ${validRatingTypes.join(", ")}`
            );
        }

        const currentYear = new Date().getFullYear();
        const ageGroupRanges: { [key: string]: [number, number] } = {
            "U8": [currentYear - 8, currentYear],
            "U10": [currentYear - 10, currentYear],
            "U12": [currentYear - 12, currentYear],
            "U14": [currentYear - 14, currentYear],
            "U16": [currentYear - 16, currentYear],
            "U18": [currentYear - 18, currentYear],
            "U20": [currentYear - 19, currentYear],
            "S40": [currentYear - 49, currentYear - 40],
            "S50": [currentYear - 59, currentYear - 50],
            "S60": [currentYear - 69, currentYear - 60],
            "S70": [currentYear - 79, currentYear - 70]
        };

        const groupsToProcess = groupCode 
            ? [groupCode] 
            : validGroupCodes;

        const ratingField = `${ratingType}_rating`;

        const results = await Promise.all(
            groupsToProcess.map(async (group) => {
                const [minBirth, maxBirth] = ageGroupRanges[group];

                // Get all players in age group with optional gender filter
                const filter: any = {
                    birthday: { $gte: String(minBirth), $lte: String(maxBirth) }
                };
                if (gender) {
                    filter.sex = String(gender);
                }
                // Exclude inactive players unless specified
                if (!includeInactive) {
                    filter.flag = { $in: [null, "", "w"] }; // Only include active flags
                }

                const allPlayers = (await PlayerModel.find(filter).lean()) as any[];

                // Count active and inactive players in this age group
                const activePlayers = allPlayers.filter(p => [null, "", "w"].includes(p.flag));
                const inactivePlayers = allPlayers.filter(p => ["i", "wi"].includes(p.flag));

                // Separate by gender
                const malePlayersWithRating = allPlayers
                    .filter(p => p.sex === "M" && p[ratingField])
                    .sort((a, b) => (b[ratingField] || 0) - (a[ratingField] || 0));

                const femalePlayersWithRating = allPlayers
                    .filter(p => p.sex === "F" && p[ratingField])
                    .sort((a, b) => (b[ratingField] || 0) - (a[ratingField] || 0));

                const malePlayersNoRating = allPlayers.filter(
                    p => p.sex === "M" && !p[ratingField]
                );
                const femalePlayersNoRating = allPlayers.filter(
                    p => p.sex === "F" && !p[ratingField]
                );

                // Calculate top 10 averages
                const maleTop10Avg = malePlayersWithRating.length > 0
                    ? malePlayersWithRating
                        .slice(0, 10)
                        .reduce((sum, p) => sum + (p[ratingField] || 0), 0) / Math.min(10, malePlayersWithRating.length)
                    : null;

                const femaleTop10Avg = femalePlayersWithRating.length > 0
                    ? femalePlayersWithRating
                        .slice(0, 10)
                        .reduce((sum, p) => sum + (p[ratingField] || 0), 0) / Math.min(10, femalePlayersWithRating.length)
                    : null;

                // Find youngest and oldest
                const sortedByBirth = allPlayers.sort(
                    (a, b) => parseInt(b.birthday || "0") - parseInt(a.birthday || "0")
                );

                const youngest = sortedByBirth[0];
                const oldest = sortedByBirth[sortedByBirth.length - 1];

                return {
                    ageGroup: group,
                    totalPlayers: allPlayers.length,
                    activePlayers: activePlayers.length,
                    inactivePlayers: inactivePlayers.length,
                    byGender: {
                        male: {
                            totalCount: allPlayers.filter(p => p.sex === "M").length,
                            withRating: {
                                count: malePlayersWithRating.length,
                                avgRatingTop10: maleTop10Avg ? Math.round(maleTop10Avg * 100) / 100 : null,
                                top10Players: malePlayersWithRating.slice(0, 10).map(p => ({
                                    id_number: p.id_number,
                                    name: p.name,
                                    title: p.title || [],
                                    rating: p[ratingField],
                                    birthday: p.birthday
                                }))
                            },
                            withoutRating: {
                                count: malePlayersNoRating.length
                            }
                        },
                        female: {
                            totalCount: allPlayers.filter(p => p.sex === "F").length,
                            withRating: {
                                count: femalePlayersWithRating.length,
                                avgRatingTop10: femaleTop10Avg ? Math.round(femaleTop10Avg * 100) / 100 : null,
                                top10Players: femalePlayersWithRating.slice(0, 10).map(p => ({
                                    id_number: p.id_number,
                                    name: p.name,
                                    title: p.title || [],
                                    rating: p[ratingField],
                                    birthday: p.birthday
                                }))
                            },
                            withoutRating: {
                                count: femalePlayersNoRating.length
                            }
                        }
                    },
                    extremes: {
                        youngest: youngest ? {
                            id_number: youngest.id_number,
                            name: youngest.name,
                            title: youngest.title || [],
                            birthYear: youngest.birthday,
                            age: currentYear - parseInt(youngest.birthday || "0"),
                            sex: youngest.sex,
                            rating: youngest[ratingField] || null
                        } : null,
                        oldest: oldest ? {
                            id_number: oldest.id_number,
                            name: oldest.name,
                            title: oldest.title || [],
                            birthYear: oldest.birthday,
                            age: currentYear - parseInt(oldest.birthday || "0"),
                            sex: oldest.sex,
                            rating: oldest[ratingField] || null
                        } : null
                    },
                    ratingType
                };
            })
        );

        return groupCode ? results[0] : results;
    }

    /**
     * Helper: Add rank to players
     */
    private addRankToPlayers(
        players: any[],
        pageNum: number,
        sizeNum: number
    ): any[] {
        return players.map((player, index) => ({
            ...player.toObject?.() || player,
            rank: (pageNum * sizeNum) + index + 1
        }));
    }

    /**
     * Get players grouped by title category (Trainers, Arbiters, Organizers, etc.)
     * Note: Player status (active/inactive based on flag) is shown separately from titles.
     * Organizational titles (o_title) are not dependent on player activity status.
     */
    async getTitlePlayers(): Promise<any> {
        const stats = await PlayerModel.aggregate([
            {
                $facet: {
                    // Overall player count by status
                    allPlayers: [
                        { $count: "count" }
                    ],
                    activePlayers: [
                        { $match: { flag: { $in: [null, "", "w"] } } },
                        { $count: "count" }
                    ],
                    inactivePlayers: [
                        { $match: { flag: { $in: ["i", "wi"] } } },
                        { $count: "count" }
                    ],
                    // Trainers: FST, FT, SI, NI, DI (in o_title only)
                    trainers: [
                        {
                            $match: {
                                o_title: { $in: ["FST", "FT", "SI", "NI", "DI"] }
                            }
                        },
                        {
                            $unwind: "$o_title"
                        },
                        {
                            $match: {
                                o_title: { $in: ["FST", "FT", "SI", "NI", "DI"] }
                            }
                        },
                        {
                            $group: {
                                _id: "$o_title",
                                count: { $sum: 1 },
                                activeCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", [null, "", "w"]] }, 1, 0]
                                    }
                                },
                                inactiveCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", ["i", "wi"]] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    trainersSummary: [
                        {
                            $match: {
                                o_title: { $in: ["FST", "FT", "SI", "NI", "DI"] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalCount: { $sum: 1 },
                                activeCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", [null, "", "w"]] }, 1, 0]
                                    }
                                },
                                inactiveCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", ["i", "wi"]] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    // Arbiters: IA, FA, NA (in o_title only, NOT including IO)
                    arbiters: [
                        {
                            $match: {
                                o_title: { $in: ["IA", "FA", "NA"] }
                            }
                        },
                        {
                            $unwind: "$o_title"
                        },
                        {
                            $match: {
                                o_title: { $in: ["IA", "FA", "NA"] }
                            }
                        },
                        {
                            $group: {
                                _id: "$o_title",
                                count: { $sum: 1 },
                                activeCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", [null, "", "w"]] }, 1, 0]
                                    }
                                },
                                inactiveCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", ["i", "wi"]] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    arbitersSummary: [
                        {
                            $match: {
                                o_title: { $in: ["IA", "FA", "NA"] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalCount: { $sum: 1 },
                                activeCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", [null, "", "w"]] }, 1, 0]
                                    }
                                },
                                inactiveCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", ["i", "wi"]] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    // Chess Composers/Organizers: indicated by foa field
                    organizers: [
                        {
                            $match: {
                                foa: { $exists: true, $ne: [] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalCount: { $sum: 1 },
                                activeCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", [null, "", "w"]] }, 1, 0]
                                    }
                                },
                                inactiveCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", ["i", "wi"]] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    // Competitive chess titles: GM, WGM, IM, WIM, FM, WFM, CM, WCM
                    chessPlayers: [
                        {
                            $match: {
                                $or: [
                                    { title: { $in: ["GM", "WGM", "IM", "WIM", "FM", "WFM", "CM", "WCM"] } },
                                    { w_title: { $in: ["GM", "WGM", "IM", "WIM", "FM", "WFM", "CM", "WCM"] } },
                                    { o_title: { $in: ["GM", "WGM", "IM", "WIM", "FM", "WFM", "CM", "WCM"] } }
                                ]
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalCount: { $sum: 1 },
                                activeCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", [null, "", "w"]] }, 1, 0]
                                    }
                                },
                                inactiveCount: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", ["i", "wi"]] }, 1, 0]
                                    }
                                },
                                gm: {
                                    $sum: {
                                        $cond: [{ $in: ["GM", "$title"] }, 1, 0]
                                    }
                                },
                                wgm: {
                                    $sum: {
                                        $cond: [{ $in: ["WGM", "$title"] }, 1, 0]
                                    }
                                },
                                im: {
                                    $sum: {
                                        $cond: [{ $in: ["IM", "$title"] }, 1, 0]
                                    }
                                },
                                wim: {
                                    $sum: {
                                        $cond: [{ $in: ["WIM", "$title"] }, 1, 0]
                                    }
                                },
                                fm: {
                                    $sum: {
                                        $cond: [{ $in: ["FM", "$title"] }, 1, 0]
                                    }
                                },
                                wfm: {
                                    $sum: {
                                        $cond: [{ $in: ["WFM", "$title"] }, 1, 0]
                                    }
                                },
                                cm: {
                                    $sum: {
                                        $cond: [{ $in: ["CM", "$title"] }, 1, 0]
                                    }
                                },
                                wcm: {
                                    $sum: {
                                        $cond: [{ $in: ["WCM", "$title"] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    // Titled players summary
                    titledSummary: [
                        {
                            $match: {
                                $or: [
                                    { title: { $ne: [] } },
                                    { w_title: { $ne: [] } },
                                    { o_title: { $ne: [] } }
                                ]
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalTitledPlayers: { $sum: 1 },
                                activeTitledPlayers: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", [null, "", "w"]] }, 1, 0]
                                    }
                                },
                                inactiveTitledPlayers: {
                                    $sum: {
                                        $cond: [{ $in: ["$flag", ["i", "wi"]] }, 1, 0]
                                    }
                                },
                                byGender: {
                                    $push: {
                                        sex: "$sex",
                                        name: "$name"
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0];

        // Build trainer breakdown from array
        const trainerBreakdown: { [key: string]: number } = {
            fst: 0, ft: 0, si: 0, ni: 0, di: 0
        };
        (result.trainers || []).forEach((t: any) => {
            const key = t._id.toLowerCase();
            trainerBreakdown[key] = t.count || 0;
        });

        // Build arbiter breakdown from array
        const arbiterBreakdown: { [key: string]: number } = {
            ia: 0, fa: 0, na: 0
        };
        (result.arbiters || []).forEach((a: any) => {
            const key = a._id.toLowerCase();
            arbiterBreakdown[key] = a.count || 0;
        });

        const trainerSummary = result.trainersSummary[0] || {};
        const arbiterSummary = result.arbitersSummary[0] || {};

        return {
            playerStatus: {
                totalPlayers: result.allPlayers[0]?.count || 0,
                activePlayers: result.activePlayers[0]?.count || 0,
                inactivePlayers: result.inactivePlayers[0]?.count || 0
            },
            trainers: {
                total: trainerSummary.totalCount || 0,
                active: trainerSummary.activeCount || 0,
                inactive: trainerSummary.inactiveCount || 0,
                types: trainerBreakdown
            },
            arbiters: {
                total: arbiterSummary.totalCount || 0,
                active: arbiterSummary.activeCount || 0,
                inactive: arbiterSummary.inactiveCount || 0,
                types: arbiterBreakdown
            },
            organizers: {
                total: result.organizers[0]?.totalCount || 0,
                active: result.organizers[0]?.activeCount || 0,
                inactive: result.organizers[0]?.inactiveCount || 0
            },
            chessPlayers: {
                total: result.chessPlayers[0]?.totalCount || 0,
                active: result.chessPlayers[0]?.activeCount || 0,
                inactive: result.chessPlayers[0]?.inactiveCount || 0,
                breakdown: {
                    gm: result.chessPlayers[0]?.gm || 0,
                    wgm: result.chessPlayers[0]?.wgm || 0,
                    im: result.chessPlayers[0]?.im || 0,
                    wim: result.chessPlayers[0]?.wim || 0,
                    fm: result.chessPlayers[0]?.fm || 0,
                    wfm: result.chessPlayers[0]?.wfm || 0,
                    cm: result.chessPlayers[0]?.cm || 0,
                    wcm: result.chessPlayers[0]?.wcm || 0
                }
            },
            summary: {
                totalTitledPlayers: result.titledSummary[0]?.totalTitledPlayers || 0,
                activeTitledPlayers: result.titledSummary[0]?.activeTitledPlayers || 0,
                inactiveTitledPlayers: result.titledSummary[0]?.inactiveTitledPlayers || 0,
                maleCount: result.titledSummary[0]?.byGender?.filter((p: any) => p.sex === "M").length || 0,
                femaleCount: result.titledSummary[0]?.byGender?.filter((p: any) => p.sex === "F").length || 0
            }
        };
    }

    /**
     * Get detailed list of players by title type
     * Note: Both active and inactive players are included, with status shown separately.
     * Organizational titles (o_title like trainers, arbiters) are independent of player status.
     */
    async getPlayersByTitleType(titleType: string): Promise<any> {
        const titleGroups: { [key: string]: string[] } = {
            trainers: ["FST", "FT", "SI", "NI", "DI"],
            arbiters: ["IA", "FA", "NA"],
            gm: ["GM"],
            wgm: ["WGM"],
            im: ["IM"],
            wim: ["WIM"],
            fm: ["FM"],
            wfm: ["WFM"]
        };

        const titles = titleGroups[titleType.toLowerCase()] || [titleType.toUpperCase()];

        const players = await PlayerModel.find({
            $or: [
                { title: { $in: titles } },
                { w_title: { $in: titles } },
                { o_title: { $in: titles } }
            ]
        }, {
            name: 1,
            id_number: 1,
            federation: 1,
            sex: 1,
            title: 1,
            w_title: 1,
            o_title: 1,
            standard_rating: 1,
            rapid_rating: 1,
            blitz_rating: 1,
            birthday: 1,
            flag: 1
        }).sort({ name: 1 });

        // Separate into active and inactive
        const activePlayers = players.filter(p => [null, "", "w"].includes(p.flag));
        const inactivePlayers = players.filter(p => p.flag && ["i", "wi"].includes(p.flag));

        // Calculate breakdown by specific title for group types
        let breakdown: { [key: string]: number } = {};
        
        if (titleType.toLowerCase() === "trainers") {
            breakdown = {
                FST: 0,
                FT: 0,
                SI: 0,
                NI: 0,
                DI: 0
            };
            
            players.forEach((p: any) => {
                // Trainers are always in o_title
                titles.forEach(title => {
                    if (p.o_title?.includes(title)) {
                        breakdown[title]++;
                    }
                });
            });
        } else if (titleType.toLowerCase() === "arbiters") {
            breakdown = {
                IA: 0,
                FA: 0,
                NA: 0
            };
            
            players.forEach((p: any) => {
                // Arbiters are always in o_title
                titles.forEach(title => {
                    if (p.o_title?.includes(title)) {
                        breakdown[title]++;
                    }
                });
            });
        }

        return {
            titleType: titleType,
            totalCount: players.length,
            activeCount: activePlayers.length,
            inactiveCount: inactivePlayers.length,
            breakdown: Object.keys(breakdown).length > 0 ? breakdown : null,
            players: players.map((player: any) => ({
                ...player.toObject(),
                status: [null, "", "w"].includes(player.flag) ? "active" : "inactive",
                primaryTitle: titles.find(t => player.title?.includes(t) || player.w_title?.includes(t) || player.o_title?.includes(t))
            }))
        };
    }
}

export default PlayersService;