import { Router } from "express";
import PlayersController from "./players.controller.js";

const router = Router();
const playersController = new PlayersController();

/**
 * @swagger
 * /players/stats:
 *   get:
 *     summary: Get database statistics
 *     description: Retrieve aggregated statistics about the player database (total count, gender breakdown, federation breakdown, average ratings, titled players count)
 *     tags:
 *       - Players
 *     responses:
 *       200:
 *         description: Database statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPlayers:
 *                       type: number
 *                     byGender:
 *                       type: array
 *                       items:
 *                         type: object
 *                     byFederation:
 *                       type: array
 *                       items:
 *                         type: object
 *                     averageRatings:
 *                       type: object
 *                       properties:
 *                         avgStandard:
 *                           type: number
 *                         avgRapid:
 *                           type: number
 *                         avgBlitz:
 *                           type: number
 *                     titledPlayers:
 *                       type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stats", (req, res, next) =>
    playersController.getPlayerStats(req, res, next)
);

/**
 * @swagger
 * /players/stats/age-groups:
 *   get:
 *     summary: Get age group statistics for all groups
 *     description: Retrieve comprehensive statistics for all age groups including total players, top 10 average ratings by gender, youngest/oldest players, and players with/without ratings
 *     tags:
 *       - Players
 *     parameters:
 *       - name: ratingType
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [standard, rapid, blitz]
 *           default: standard
 *         description: Type of rating to analyze
 *         example: "standard"
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [M, F]
 *         description: Filter by gender (M=Male, F=Female). If not provided, returns all genders
 *         example: "M"
 *     responses:
 *       200:
 *         description: Age group statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ageGroup:
 *                         type: string
 *                       totalPlayers:
 *                         type: number
 *                       byGender:
 *                         type: object
 *                       extremes:
 *                         type: object
 *                       ratingType:
 *                         type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalAgeGroups:
 *                       type: number
 *                     ratingType:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid rating type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stats/age-groups", (req, res, next) =>
    playersController.getAgeGroupStats(req, res, next)
);

/**
 * @swagger
 * /players/{id_number}:
 *   get:
 *     summary: Get player by FIDE ID
 *     description: Retrieve a single player's complete details by their FIDE ID
 *     tags:
 *       - Players
 *     parameters:
 *       - name: id_number
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Player's FIDE ID
 *         example: "3300001"
 *     responses:
 *       200:
 *         description: Player found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleResponse'
 *       400:
 *         description: Invalid player ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Player not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id_number", (req, res, next) =>
    playersController.getPlayerById(req, res, next)
);

/**
 * @swagger
 * /players/search/by-fide-id:
 *   get:
 *     summary: Search player by FIDE ID
 *     description: Search for a player using their FIDE ID with exact match
 *     tags:
 *       - Players
 *     parameters:
 *       - name: id_number
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: FIDE player ID
 *         example: "3300001"
 *     responses:
 *       200:
 *         description: Player found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleResponse'
 *       400:
 *         description: Missing FIDE ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No player found with given FIDE ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search/by-fide-id", (req, res, next) =>
    playersController.searchByFideId(req, res, next)
);

/**
 * @swagger
 * /players/search/by-name:
 *   get:
 *     summary: Search players by name
 *     description: Search players by name with case-insensitive partial matching and pagination
 *     tags:
 *       - Players
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Player's full name or partial name
 *         example: "Giri"
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *           default: 0
 *         description: Page number (0-indexed)
 *       - name: size
 *         in: query
 *         schema:
 *           type: number
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Players found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search/by-name", (req, res, next) =>
    playersController.searchByName(req, res, next)
);

/**
 * @swagger
 * /players/search/advanced:
 *   get:
 *     summary: Advanced player search with multiple filters
 *     description: Search players with multiple filter options (federation, gender, title, rating range)
 *     tags:
 *       - Players
 *     parameters:
 *       - name: federation
 *         in: query
 *         schema:
 *           type: string
 *         description: Country federation code
 *         example: "NEP"
 *       - name: sex
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["M", "F"]
 *         description: Gender filter
 *       - name: title
 *         in: query
 *         schema:
 *           type: string
 *         description: Playing title (GM, IM, FM, etc.)
 *         example: "GM"
 *       - name: minRating
 *         in: query
 *         schema:
 *           type: number
 *         description: Minimum standard rating
 *         example: 2000
 *       - name: maxRating
 *         in: query
 *         schema:
 *           type: number
 *         description: Maximum standard rating
 *         example: 2500
 *       - name: hasTitle
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter players with any title
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *           default: 0
 *       - name: size
 *         in: query
 *         schema:
 *           type: number
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Filtered players found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid filter parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search/advanced", (req, res, next) =>
    playersController.advancedSearch(req, res, next)
);

/**
 * @swagger
 * /players/federation/{federation}:
 *   get:
 *     summary: Get players by federation
 *     description: Retrieve all players from a specific federation
 *     tags:
 *       - Players
 *     parameters:
 *       - name: federation
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Country federation code
 *         example: "NEP"
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["standard", "rapid", "blitz"]
 *           default: "standard"
 *         description: Sort by rating type
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["M", "F"]
 *         description: Filter by gender
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *           default: 0
 *       - name: size
 *         in: query
 *         schema:
 *           type: number
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Federation players retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/federation/:federation", (req, res, next) =>
    playersController.getPlayersByFederation(req, res, next)
);

/**
 * @swagger
 * /players/titles/all:
 *   get:
 *     summary: Get title players statistics
 *     description: Retrieve aggregated statistics of titled players grouped by category (Trainers, Arbiters, Grand Masters, International Masters, etc.)
 *     tags:
 *       - Titles
 *     responses:
 *       200:
 *         description: Title players statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainers:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         types:
 *                           type: object
 *                     arbiters:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         types:
 *                           type: object
 *                     organizers:
 *                       type: object
 *                     chessPlayers:
 *                       type: object
 *                     summary:
 *                       type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/titles/all", (req, res, next) =>
    playersController.getTitlePlayers(req, res, next)
);

/**
 * @swagger
 * /players/titles/by-type:
 *   get:
 *     summary: Get players by title type
 *     description: Retrieve detailed list of players with a specific title type
 *     tags:
 *       - Titles
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [trainers, arbiters, gm, wgm, im, wim, fm, wfm]
 *         description: Title type to filter by
 *         example: "trainers"
 *     responses:
 *       200:
 *         description: Players with title retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     titleType:
 *                       type: string
 *                     totalCount:
 *                       type: number
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing title type parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/titles/by-type", (req, res, next) =>
    playersController.getPlayersByTitleType(req, res, next)
);

export default router;
