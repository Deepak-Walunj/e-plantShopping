import crypto from "crypto";
import { runWithRequestContext } from "./requestContext.js";

export function requestContextMiddleware(req, res, next) {
    const requestId = crypto.randomUUID();

    runWithRequestContext({ requestId }, () => {
        next();
    });
}