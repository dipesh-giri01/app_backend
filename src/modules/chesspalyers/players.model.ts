import mongoose from "mongoose";
import type { Document, Schema as MongooseSchema, Model } from "mongoose";
import { PlayerTitle } from "./players.enum";

export interface IPlayer extends Document {
    id_number: string;
    name: string;
    federation: string;
    sex: string;
    title: string[];
    w_title: string[];
    o_title: string[];
    foa: string[];
    standard_rating: number;
    standard_games: number;
    sk: number;
    rapid_rating: number;
    rapid_games: number;
    rk: number;
    blitz_rating: number;
    blitz_games: number;
    bk: number;
    birthday: string | null;
    flag: string | null;
}

const playerSchema: MongooseSchema<IPlayer> = new mongoose.Schema({
    id_number: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    federation: { type: String, required: true },
    sex: { type: String, required: true },
    title: { type: [String], default: [], required: true },
    w_title: { type: [String], default: [], required: true },
    o_title: { type: [String], default: [], required: true },
    foa: { type: [String], default: [], required: true },
    standard_rating: { type: Number, required: true },
    standard_games: { type: Number, required: true },
    sk: { type: Number, required: true },
    rapid_rating: { type: Number, required: true },
    rapid_games: { type: Number, required: true },
    rk: { type: Number, required: true },
    blitz_rating: { type: Number, required: true },
    blitz_games: { type: Number, required: true },
    bk: { type: Number, required: true },
    birthday: { type: String, default: null },
    flag: { type: String, default: null }
}, {
    timestamps: true
});

const PlayerModel: Model<IPlayer> = mongoose.model<IPlayer>("Player", playerSchema, "nepali_players");

export default PlayerModel;