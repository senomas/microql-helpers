import * as yaml from "js-yaml";
import KeyEncoder from "key-encoder";
import * as bunyan from "bunyan";
import crypto from "crypto";
import * as fs from "fs";
import * as os from "os";

export const NODE_ENV = (process.env.NODE_ENV || "production").toLowerCase();

export const config = yaml.safeLoad(fs.readFileSync("config.yaml").toString());

export const keyEncoder = new KeyEncoder(config.auth.curves);

export const appName = process.env.APP_NAME || "app";
if (config.logger && config.logger.path && !fs.existsSync(config.logger.path)) {
  fs.mkdirSync(config.logger.path);
}
const serializers = {
  req: req => {
    if (!req || !req.connection) {
      return req;
    }
    return {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: req.headers,
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort
    };
  },
  res: bunyan.stdSerializers.res,
  err: bunyan.stdSerializers.err
};

export const logger = bunyan.createLogger(
  (config.logger && config.logger.path) ? {
    name: appName,
    serializers,
    streams: [{
      type: "rotating-file",
      ...config.logger,
      path: `${process.env.LOGGER_PATH || config.logger.path || "."}/${appName}-${os.hostname()}.log`,
    }]
  } : { name: appName, serializers });

const raw = keyEncoder.encodePrivate(config.keys[appName].pkey, "pem", "raw");
export const moduleKey = crypto.createECDH(config.auth.curves);
moduleKey.setPrivateKey(raw, "hex");
config.keys[appName].raw = moduleKey;

Object.values(config.keys).forEach((v: any) => {
  if (v.pkey && !v.key) {
    if (!v.raw) {
      const raw = keyEncoder.encodePrivate(v.pkey, "pem", "raw");
      v.raw = crypto.createECDH(config.auth.curves);
      v.raw.setPrivateKey(raw, "hex");
    }
    v.key = keyEncoder.encodePublic(v.raw.getPublicKey().toString("hex"), "raw", "pem");
  }
});
