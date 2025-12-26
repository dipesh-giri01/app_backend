import { Router } from "express";
import PlayersController from "./players.controller.js";

const router = Router();
const playersController = new PlayersController();

/**
 * @swagger
 * /rankings/standard:
 *   get:
 *     summary: Get standard rating rankings
 *     description: Retrieve top-ranked players sorted by standard rating in descending order
 *     tags:
 *       - Rankings
 *     parameters:
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["M", "F"]
 *         description: Filter by gender
 *       - name: federation
 *         in: query
 *         schema:
 *           type: string
 *         description: Country federation code
 *         example: "NEP"
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
 *       - name: includeInactive
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive players (I - inactive, WI - woman inactive) in rankings
 *     responses:
 *       200:
 *         description: Standard ratings retrieved
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
router.get("/standard", (req, res, next) =>
    playersController.getRankingsStandard(req, res, next)
);

/**
 * @swagger
 * /rankings/rapid:
 *   get:
 *     summary: Get rapid rating rankings
 *     description: Retrieve top-ranked players sorted by rapid rating in descending order
 *     tags:
 *       - Rankings
 *     parameters:
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["M", "F"]
 *         description: Filter by gender
 *       - name: federation
 *         in: query
 *         schema:
 *           type: string
 *         description: Country federation code
 *         example: "NEP"
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
 *       - name: includeInactive
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive players in rankings
 *     responses:
 *       200:
 *         description: Rapid ratings retrieved
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
router.get("/rapid", (req, res, next) =>
    playersController.getRankingsRapid(req, res, next)
);

/**
 * @swagger
 * /rankings/blitz:
 *   get:
 *     summary: Get blitz rating rankings
 *     description: Retrieve top-ranked players sorted by blitz rating in descending order
 *     tags:
 *       - Rankings
 *     parameters:
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["M", "F"]
 *         description: Filter by gender
 *       - name: federation
 *         in: query
 *         schema:
 *           type: string
 *         description: Country federation code
 *         example: "NEP"
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
 *       - name: includeInactive
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive players in rankings
 *     responses:
 *       200:
 *         description: Blitz ratings retrieved
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
router.get("/blitz", (req, res, next) =>
    playersController.getRankingsBlitz(req, res, next)
);

/**
 * @swagger
 * /rankings/age-group/{groupCode}:
 *   get:
 *     summary: Get age group rankings
 *     description: Retrieve ranked players within a specific age group. Supports 11 age categories (U8, U10, U12, U14, U16, U18, S20, S40, S50, S60, S70)
 *     tags:
 *       - Rankings
 *     parameters:
 *       - name: groupCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["U8", "U10", "U12", "U14", "U16", "U18", "S20", "S40", "S50", "S60", "S70"]
 *         description: Age group code (U=Under, S=Seniors)
 *         example: "U18"
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["M", "F"]
 *         description: Filter by gender
 *       - name: ratingType
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["standard", "rapid", "blitz"]
 *           default: "standard"
 *         description: Rating type for ranking
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
 *         description: Age group rankings retrieved (includes age field for each player)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     groupCode:
 *                       type: string
 *                       description: The age group code requested
 *       400:
 *         description: Invalid age group code or parameters
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
router.get("/age-group/:groupCode", (req, res, next) =>
    playersController.getRankingsByAgeGroup(req, res, next)
);

export default router;
