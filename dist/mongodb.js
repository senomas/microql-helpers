"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const config_1 = require("./config");
class MongoModel {
    constructor(mongodb, collection) {
        this.mongodb = mongodb;
        this.collection = collection;
        this.loadKey = (data) => ({ _id: data._id });
        this.loadEnhance = (data) => data;
        this.db = mongodb.db;
    }
    async insertOne(value, options = null) {
        return this.collection.insertOne(value, options);
    }
    async updateOne(filter, update, options = null) {
        return this.collection.updateOne(filter, update, options);
    }
    async updateMany(filter, update, options = null) {
        return this.collection.updateMany(filter, update, options);
    }
    async deleteMany(filter, options = null) {
        return this.collection.deleteMany(filter, options);
    }
    async findOne(query, options = null) {
        return this.collection.findOne(query, options);
    }
    count(query, options = null) {
        return this.collection.countDocuments(query, options);
    }
    find(query, options = null) {
        return this.collection.find(query, options);
    }
    async load(data) {
        if (Array.isArray(data)) {
            const bw = [];
            for (const v of data) {
                bw.push({
                    updateOne: {
                        filter: await this.loadKey(v),
                        update: {
                            $set: await this.loadEnhance(v)
                        },
                        upsert: true
                    }
                });
            }
            return await this.collection.bulkWrite(bw);
        }
        const res = await this.collection.updateOne(await this.loadKey(data), {
            $set: await this.loadEnhance(data)
        }, {
            upsert: true
        });
        return res;
    }
}
exports.MongoModel = MongoModel;
class Mongodb {
    constructor() {
        this.models = {};
    }
    async init(config) {
        const mongoUri = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port ||
            "27017"}/${config.mongodb.database || "account"}${config.mongodb.params ?
            "?" + Object.entries(config.mongodb.params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&") : ""}`;
        config_1.logger.info({ mongoUri, config: config.mongodb }, "mongoUri");
        this.db = (await mongodb_1.MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })).db(config.mongodb.database);
        const sequence = this.db.collection("sequence");
        await sequence.createIndex({ key: 1, time: 1 }, {
            unique: true
        });
    }
    async create(name, options = null) {
        const col = this.db.collection(name);
        const model = this.models[name] = new MongoModel(this, col);
        return model;
    }
}
exports.Mongodb = Mongodb;
exports.mongodb = new Mongodb();
//# sourceMappingURL=mongodb.js.map