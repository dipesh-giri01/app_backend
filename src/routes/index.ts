import { Router } from "express";
import playersRoutes from "../modules/chesspalyers/players.routes.js";
import rankingsRoutes from "../modules/chesspalyers/rankings.routes.js";


const router = Router();


router.get("/health-check", (req, res) => {
    res.status(200).send("API is healthy");
});



// Chess Players API Routes
router.use("/players", playersRoutes);
router.use("/rankings", rankingsRoutes);

export { router as IndexRouter };