// src/auth/publicHttp.js
import axios from "axios";

export const pub = axios.create({
  baseURL: "/api",
  withCredentials: false, // important: no cookies for this endpoint
});
