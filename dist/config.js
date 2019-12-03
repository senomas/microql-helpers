"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = __importStar(require("js-yaml"));
const key_encoder_1 = __importDefault(require("key-encoder"));
const bunyan = __importStar(require("bunyan"));
const crypto_1 = __importDefault(require("crypto"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
exports.NODE_ENV = (process.env.NODE_ENV || "production").toLowerCase();
exports.config = yaml.safeLoad(fs.readFileSync("config.yaml").toString());
exports.keyEncoder = new key_encoder_1.default(exports.config.auth.curves);
exports.appName = process.env.APP_NAME || "app";
if (exports.config.logger && exports.config.logger.path && !fs.existsSync(exports.config.logger.path)) {
    fs.mkdirSync(exports.config.logger.path);
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
exports.logger = bunyan.createLogger((exports.config.logger && exports.config.logger.path) ? {
    name: exports.appName,
    serializers,
    streams: [Object.assign(Object.assign({ type: "rotating-file" }, exports.config.logger), { path: `${process.env.LOGGER_PATH || exports.config.logger.path || "."}/${exports.appName}-${os.hostname()}.log` })]
} : { name: exports.appName, serializers });
const raw = exports.keyEncoder.encodePrivate(exports.config.keys[exports.appName].pkey, "pem", "raw");
exports.moduleKey = crypto_1.default.createECDH(exports.config.auth.curves);
exports.moduleKey.setPrivateKey(raw, "hex");
exports.config.keys[exports.appName].raw = exports.moduleKey;
Object.values(exports.config.keys).forEach((v) => {
    if (v.pkey && !v.key) {
        if (!v.raw) {
            const raw = exports.keyEncoder.encodePrivate(v.pkey, "pem", "raw");
            v.raw = crypto_1.default.createECDH(exports.config.auth.curves);
            v.raw.setPrivateKey(raw, "hex");
        }
        v.key = exports.keyEncoder.encodePublic(v.raw.getPublicKey().toString("hex"), "raw", "pem");
    }
});
//# sourceMappingURL=config.js.map