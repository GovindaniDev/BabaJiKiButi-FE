import { app } from "./http";

const res = await app.post("/products", payload);