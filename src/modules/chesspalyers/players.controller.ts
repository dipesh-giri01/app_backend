import { Request, Response, NextFunction } from "express";
import PlayerModel from "./players.model.js";
import PlayersService from "./players.service.js";

class PlayersController {
    private playersService: PlayersService;

    constructor() {
        this.playersService = new PlayersService(PlayerModel);
    }

    /**
     * GET /players/{id_number}
     * Retrieve a single player by FIDE ID
     */
    async getPlayerById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id_number } = req.params;
            const player = await this.playersService.getPlayerById(id_number);

            res.json({
                success: true,
                data: player,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/search/by-fide-id
     * Search player by FIDE ID (exact match)
     */
    async searchByFideId(req: Request, res: Response, next: NextFunction) {
        try {
            const { id_number } = req.query;
            const player = await this.playersService.searchByFideId(String(id_number));

            res.json({
                success: true,
                data: player,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/search/by-name
     * Search players by name (case-insensitive partial match)
     */
    async searchByName(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, page, size } = req.query;
            const result = await this.playersService.searchByName(
                String(name),
                page,
                size
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/search/advanced
     * Advanced search with multiple filters
     */
    async advancedSearch(req: Request, res: Response, next: NextFunction) {
        try {
            const { federation, sex, title, minRating, maxRating, hasTitle, page, size } = req.query;

            const result = await this.playersService.advancedSearch(
                {
                    federation: federation as string,
                    sex: sex as string,
                    title: title as string,
                    minRating: minRating as string,
                    maxRating: maxRating as string,
                    hasTitle: hasTitle as string
                },
                page,
                size
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /rankings/standard
     * Get top-ranked players by standard rating
     */
    async getRankingsStandard(req: Request, res: Response, next: NextFunction) {
        try {
            const { gender, federation, page, size, includeInactive } = req.query;
            const include = includeInactive === 'true';

            const result = await this.playersService.getRankingsStandard(
                gender as string,
                federation as string,
                page,
                size,
                include
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                filters: {
                    includeInactive: include
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /rankings/rapid
     * Get top-ranked players by rapid rating
     */
    async getRankingsRapid(req: Request, res: Response, next: NextFunction) {
        try {
            const { gender, federation, page, size, includeInactive } = req.query;
            const include = includeInactive === 'true';

            const result = await this.playersService.getRankingsRapid(
                gender as string,
                federation as string,
                page,
                size,
                include
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                filters: {
                    includeInactive: include
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /rankings/blitz
     * Get top-ranked players by blitz rating
     */
    async getRankingsBlitz(req: Request, res: Response, next: NextFunction) {
        try {
            const { gender, federation, page, size, includeInactive } = req.query;
            const include = includeInactive === 'true';

            const result = await this.playersService.getRankingsBlitz(
                gender as string,
                federation as string,
                page,
                size,
                include
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                filters: {
                    includeInactive: include
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /rankings/age-group/{groupCode}
     * Get ranked players within a specific age group
     */
    async getRankingsByAgeGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupCode } = req.params;
            const { gender, ratingType, page, size } = req.query;

            const result = await this.playersService.getRankingsByAgeGroup(
                groupCode,
                gender as string,
                ratingType as string,
                page,
                size
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                groupCode: result.groupCode,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/federation/{federation}
     * Get all players from a specific federation
     */
    async getPlayersByFederation(req: Request, res: Response, next: NextFunction) {
        try {
            const { federation } = req.params;
            const { sortBy, gender, page, size } = req.query;

            const result = await this.playersService.getPlayersByFederation(
                federation,
                sortBy as string,
                gender as string,
                page,
                size
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                federation: result.federation,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/stats
     * Get aggregated statistics about the player database
     */
    async getPlayerStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { includeInactive } = req.query;
            const include = includeInactive === 'true';
            
            const stats = await this.playersService.getPlayerStats(include);

            res.json({
                success: true,
                data: stats,
                filters: {
                    includeInactive: include
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/stats/age-groups
     * Get comprehensive statistics for all age groups
     * Includes: total players, top 10 avg ratings by gender, youngest/oldest players
     */
    async getAgeGroupStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { ratingType = "standard", gender, includeInactive } = req.query;
            const include = includeInactive === 'true';

            const stats = await this.playersService.getAgeGroupStats(
                undefined,
                ratingType as string,
                gender as string,
                include
            );

            res.json({
                success: true,
                data: stats,
                summary: {
                    totalAgeGroups: Array.isArray(stats) ? stats.length : 1,
                    ratingType: ratingType || "standard",
                    gender: gender || "all"
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/titles/all
     * Get all title players grouped by category
     */
    async getTitlePlayers(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.playersService.getTitlePlayers();

            res.json({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /players/titles/by-type
     * Get players by specific title type (trainers, arbiters, gm, im, etc.)
     */
    async getPlayersByTitleType(req: Request, res: Response, next: NextFunction) {
        try {
            const { type } = req.query;

            if (!type) {
                return res.status(400).json({
                    success: false,
                    message: "Title type is required",
                    timestamp: new Date().toISOString()
                });
            }

            const data = await this.playersService.getPlayersByTitleType(String(type));

            res.json({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
}

export default PlayersController;
