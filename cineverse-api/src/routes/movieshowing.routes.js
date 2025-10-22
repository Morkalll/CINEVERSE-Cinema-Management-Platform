import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllMovieShowings, findOneMovieShowings, createMovieShowing, updateMovieShowing, deleteMovieShowing } from "../services/movieshowing.services.js";