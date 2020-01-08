import * as jwt from "jsonwebtoken";

import { config, logger } from "./config";

export async function getUser(ctx, req) {
  let token;
  if (req.headers) {
    token = req.headers["x-access-token"] || req.headers.authorization;
  } else {
    token = req;
  }
  if (token && token !== "") {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }
    ctx.token = token;
    return await parseToken(ctx, token);
  }
  return null;
}

export async function parseToken(ctx, token) {
  let header;
  try {
    header = JSON.parse(
      Buffer.from(token.split(".")[0], "base64").toString("utf8")
    );
  } catch (err) {
    logger.error({ token, err }, "parse-token");
    ctx.errors.push({
      path: "auth.parseToken",
      name: "InvalidTokenHeader",
      value: JSON.stringify({ token })
    });
    return null;
  }
  const keyid = header.kid;
  const key = config.keys[keyid] ? config.keys[keyid].key : null;
  if (!key) {
    logger.error({ message: "unknown key id", header }, "parse-token");
    ctx.errors.push({
      path: "auth.parseToken",
      name: "UnknownKeyID",
      value: JSON.stringify({ header })
    });
    return null;
  }
  try {
    return jwt.verify(token, key);
  } catch (err) {
    if (err && err.name === "TokenExpiredError" && ctx.refreshToken) {
      const user = jwt.decode(token);
      user.token = await ctx.refreshToken(ctx, keyid, key, user, token);
      if (user.token) {
        return user;
      }
    }
    logger.error({ header, token, err, ename: err.name, ctx: Object.keys(ctx) }, "parse-token");
    ctx.errors.push({
      path: "auth.parseToken",
      name: err.name || "InvalidToken",
      value: JSON.stringify({ token })
    });
    return null;
  }
}
