"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const type_graphql_1 = require("type-graphql");
const logger_1 = require("./logger");
const mongodb_2 = require("./mongodb");
const config_1 = require("./config");
const schemas_1 = require("./schemas");
exports.regexDupKey = /^E11000 duplicate key error collection: (\w+\.\w+) index: (\w+) dup key: (.+)$/;
function createBaseResolver(opt) {
    if (!opt.suffixPlurals) {
        opt.suffixPlurals = `${opt.suffix}s`;
    }
    if (!opt.suffixCapitalize) {
        opt.suffixCapitalize = `${opt.suffix.slice(0, 1).toUpperCase()}${opt.suffix.slice(1)}`;
    }
    if (!opt.suffixCapitalizePlurals) {
        opt.suffixCapitalizePlurals = `${opt.suffixCapitalize}s`;
    }
    let BaseResolver = class BaseResolver {
        constructor() {
            this.queryFilters = opt.queryFilters || {
                skip: () => {
                },
                limit: () => {
                }
            };
        }
        async _create(data) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                const res = await mongodb_2.mongodb.models[opt.suffix].insertOne(data);
                config_1.logger.info({ res, data }, `insert ${opt.suffix}`);
                return {
                    id: res.insertedId
                };
            }
            catch (err) {
                if (err && err.message) {
                    const m = exports.regexDupKey.exec(err.message);
                    if (m && m.length === 4) {
                        return {
                            errors: {
                                path: "",
                                name: "DuplicateEntryError",
                                value: JSON.stringify({
                                    model: m[1],
                                    index: m[2],
                                    value: m[3]
                                })
                            }
                        };
                    }
                }
                return {
                    errors: {
                        path: "",
                        name: "MongoError",
                        value: JSON.stringify({
                            name: err.name,
                            message: err.message,
                            stack: err.stack
                        })
                    }
                };
            }
        }
        async _update(filter, data) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const query = this.query(filter);
            const updates = {
                $set: data
            };
            config_1.logger.info({ filter, data, query, updates }, `update ${opt.suffix} query`);
            const res = await mongodb_2.mongodb.models[opt.suffix].updateMany(query, updates);
            config_1.logger.info({ res }, `update ${opt.suffix}`);
            return {
                matched: res.matchedCount,
                modified: res.modifiedCount
            };
        }
        async findByID(id) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const item = await mongodb_2.mongodb.models[opt.suffix].findOne({ _id: new mongodb_1.ObjectID(id) });
            if (item) {
                item.id = item._id;
            }
            return item;
        }
        async find(skip, limit, filter, orderBy) {
            const query = this.query(filter);
            config_1.logger.info({ skip, limit, filter, orderBy, query }, `${opt.suffix} query`);
            const total = await mongodb_2.mongodb.models[opt.suffix].count(query);
            const cursor = mongodb_2.mongodb.models[opt.suffix].find(query);
            if (orderBy && orderBy.length > 0) {
                const sort = {};
                for (const ob of orderBy) {
                    sort[ob.field] = ob.type === schemas_1.OrderByType.asc ? 1 : -1;
                }
                config_1.logger.info({ orderBy, sort }, `${opt.suffix} orderBy`);
                cursor.sort(sort);
            }
            if (skip) {
                cursor.skip(skip);
            }
            if (limit) {
                cursor.limit(limit);
            }
            else {
                cursor.limit(100);
            }
            const items = (await cursor.toArray()).map(item => {
                item.id = item._id;
                return item;
            });
            config_1.logger.info({ items }, opt.suffixPlurals);
            return {
                total,
                items
            };
        }
        async create(data) {
            return await this._create(data);
        }
        async update(filter, data) {
            return this._update(filter, data);
        }
        async deletes(filter) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const query = this.query(filter);
            config_1.logger.info({ filter, query }, `delete ${opt.suffix} query`);
            const res = await mongodb_2.mongodb.models[opt.suffix].deleteMany(query);
            config_1.logger.info({ res }, `delete ${opt.suffix}`);
            return {
                deleted: res.deletedCount
            };
        }
        query(filter) {
            const query = {};
            if (filter) {
                for (const [k, v] of Object.entries(filter)) {
                    if (this.queryFilters[k]) {
                        this.queryFilters[k](query, v, k);
                    }
                    else if (k === "id") {
                        query._id = new mongodb_1.ObjectID(v);
                    }
                    else {
                        query[k] = v;
                    }
                }
            }
            return query;
        }
    };
    __decorate([
        type_graphql_1.Query(returns => opt.typeCls, { nullable: true, name: `${opt.suffix}` }),
        type_graphql_1.Authorized([`${opt.suffix}.read`]),
        type_graphql_1.UseMiddleware(logger_1.LoggerResolverMiddleware),
        __param(0, type_graphql_1.Arg("id", of => type_graphql_1.ID)),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", Promise)
    ], BaseResolver.prototype, "findByID", null);
    __decorate([
        type_graphql_1.Query(returns => opt.partialTypeCls, { nullable: true, name: `${opt.suffixPlurals}` }),
        type_graphql_1.Authorized([`${opt.suffix}.read`]),
        type_graphql_1.UseMiddleware(logger_1.LoggerResolverMiddleware),
        __param(0, type_graphql_1.Arg("skip", of => type_graphql_1.Int, { nullable: true })),
        __param(1, type_graphql_1.Arg("limit", of => type_graphql_1.Int, { nullable: true })),
        __param(2, type_graphql_1.Arg("filter", of => opt.filterInput, { nullable: true })),
        __param(3, type_graphql_1.Arg("orderBy", of => [opt.orderByInput], { nullable: true })),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Number, Number, Object, Object]),
        __metadata("design:returntype", Promise)
    ], BaseResolver.prototype, "find", null);
    __decorate([
        type_graphql_1.Mutation(returns => opt.typeCls, { name: `create${opt.suffixCreate || opt.suffixCapitalize}` }),
        type_graphql_1.Authorized([`${opt.suffix}.create`]),
        type_graphql_1.UseMiddleware(logger_1.LoggerResolverMiddleware),
        __param(0, type_graphql_1.Arg("data", of => opt.createInput)),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], BaseResolver.prototype, "create", null);
    __decorate([
        type_graphql_1.Mutation(returns => schemas_1.UpdateResponse, { name: `update${opt.suffixUpdate || opt.suffixCapitalizePlurals}` }),
        type_graphql_1.Authorized([`${opt.suffix}.update`]),
        type_graphql_1.UseMiddleware(logger_1.LoggerResolverMiddleware),
        __param(0, type_graphql_1.Arg("filter", of => opt.filterInput)),
        __param(1, type_graphql_1.Arg("data", of => opt.updateInput)),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], BaseResolver.prototype, "update", null);
    __decorate([
        type_graphql_1.Mutation(returns => schemas_1.DeleteResponse, { name: `delete${opt.suffixCapitalizePlurals}` }),
        type_graphql_1.Authorized([`${opt.suffix}.delete`]),
        type_graphql_1.UseMiddleware(logger_1.LoggerResolverMiddleware),
        __param(0, type_graphql_1.Arg("filter", of => opt.filterInput)),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], BaseResolver.prototype, "deletes", null);
    BaseResolver = __decorate([
        type_graphql_1.Resolver({ isAbstract: true })
    ], BaseResolver);
    return BaseResolver;
}
exports.createBaseResolver = createBaseResolver;
//# sourceMappingURL=resolver.js.map