import { app } from "./httpAPI";

const res = await app.post("/products", payload);