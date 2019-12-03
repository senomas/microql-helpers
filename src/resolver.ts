import { ObjectID } from 'mongodb';
import { Arg, Authorized, ID, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { LoggerResolverMiddleware } from './logger';
import { mongodb } from './mongodb';
import { logger } from './config';
import { UpdateResponse, OrderByType, DeleteResponse } from './schemas';

export interface CreateBaseResolverOption {
  suffix: string;
  suffixPlurals?: string;
  suffixCapitalize?: string;
  suffixCapitalizePlurals?: string;
  suffixCreate?: string;
  suffixUpdate?: string;
  queryFilters?: null;
  typeCls;
  partialTypeCls;
  createInput;
  updateInput;
  filterInput;
  orderByInput;
}

export const regexDupKey = /^E11000 duplicate key error collection: (\w+\.\w+) index: (\w+) dup key: (.+)$/;

export interface IBaseResolver {}

export function createBaseResolver(opt: CreateBaseResolverOption): IBaseResolver {
  if (!opt.suffixPlurals) {
    opt.suffixPlurals = `${opt.suffix}s`;
  }
  if (!opt.suffixCapitalize) {
    opt.suffixCapitalize = `${opt.suffix.slice(0, 1).toUpperCase()}${opt.suffix.slice(1)}`;
  }
  if (!opt.suffixCapitalizePlurals) {
    opt.suffixCapitalizePlurals = `${opt.suffixCapitalize}s`;
  }

  @Resolver({ isAbstract: true })
  abstract class BaseResolver implements IBaseResolver {
    protected queryFilters: any = opt.queryFilters || {
      skip: () => {
        // nop
      },
      limit: () => {
        // nop
      }
    };

    protected async _create(data) {
      // FIXME delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const res = await mongodb.models[opt.suffix].insertOne(data);
        logger.info({ res, data }, `insert ${opt.suffix}`);
        return {
          id: res.insertedId
        };
      } catch (err) {
        if (err && err.message) {
          const m = regexDupKey.exec(err.message);
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

    protected async _update(filter, data): Promise<UpdateResponse> {
      // FIXME delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const query = this.query(filter);
      const updates = {
        $set: data
      };
      logger.info({ filter, data, query, updates }, `update ${opt.suffix} query`);
      const res = await mongodb.models[opt.suffix].updateMany(query, updates);
      logger.info({ res }, `update ${opt.suffix}`);
      return {
        matched: res.matchedCount,
        modified: res.modifiedCount
      };
    }

    @Query(returns => opt.typeCls, { nullable: true, name: `${opt.suffix}` })
    @Authorized([`${opt.suffix}.read`])
    @UseMiddleware(LoggerResolverMiddleware)
    public async findByID(
      @Arg("id", of => ID) id: string
    ) {
      // FIXME delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const item = await mongodb.models[opt.suffix].findOne({ _id: new ObjectID(id) });
      if (item) {
        item.id = item._id;
      }
      return item;
    }

    @Query(returns => opt.partialTypeCls, { nullable: true, name: `${opt.suffixPlurals}` })
    @Authorized([`${opt.suffix}.read`])
    @UseMiddleware(LoggerResolverMiddleware)
    public async find(
      @Arg("skip", of => Int, { nullable: true }) skip: number,
      @Arg("limit", of => Int, { nullable: true }) limit: number,
      @Arg("filter", of => opt.filterInput, { nullable: true }) filter,
      @Arg("orderBy", of => [opt.orderByInput], { nullable: true }) orderBy
    ) {
      const query = this.query(filter);
      logger.info({ skip, limit, filter, orderBy, query }, `${opt.suffix} query`);
      const total = await mongodb.models[opt.suffix].count(query);
      const cursor = mongodb.models[opt.suffix].find(query);
      if (orderBy && orderBy.length > 0) {
        const sort = {};
        for (const ob of orderBy) {
          sort[ob.field] = ob.type === OrderByType.asc ? 1 : -1;
        }
        logger.info({ orderBy, sort }, `${opt.suffix} orderBy`);
        cursor.sort(sort);
      }
      if (skip) {
        cursor.skip(skip);
      }
      if (limit) {
        cursor.limit(limit);
      } else {
        cursor.limit(100);
      }
      const items = (await cursor.toArray()).map(item => {
        item.id = item._id;
        return item;
      });
      logger.info({ items }, opt.suffixPlurals);
      return {
        total,
        items
      };
    }

    @Mutation(returns => opt.typeCls, { name: `create${opt.suffixCreate || opt.suffixCapitalize}` })
    @Authorized([`${opt.suffix}.create`])
    @UseMiddleware(LoggerResolverMiddleware)
    public async create(@Arg("data", of => opt.createInput) data) {
      return await this._create(data);
    }

    @Mutation(returns => UpdateResponse, { name: `update${opt.suffixUpdate || opt.suffixCapitalizePlurals}` })
    @Authorized([`${opt.suffix}.update`])
    @UseMiddleware(LoggerResolverMiddleware)
    public async update(
      @Arg("filter", of => opt.filterInput) filter,
      @Arg("data", of => opt.updateInput) data
    ): Promise<UpdateResponse> {
      return this._update(filter, data);
    }

    @Mutation(returns => DeleteResponse, { name: `delete${opt.suffixCapitalizePlurals}` })
    @Authorized([`${opt.suffix}.delete`])
    @UseMiddleware(LoggerResolverMiddleware)
    public async deletes(@Arg("filter", of => opt.filterInput) filter): Promise<DeleteResponse> {
      // FIXME delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const query = this.query(filter);
      logger.info({ filter, query }, `delete ${opt.suffix} query`);
      const res = await mongodb.models[opt.suffix].deleteMany(query);
      logger.info({ res }, `delete ${opt.suffix}`);
      return {
        deleted: res.deletedCount
      };
    }

    protected query(filter) {
      const query: any = {};
      if (filter) {
        for (const [k, v] of Object.entries(filter)) {
          if (this.queryFilters[k]) {
            this.queryFilters[k](query, v, k);
          } else if (k === "id") {
            query._id = new ObjectID(v);
          } else {
            query[k] = v;
          }
        }
      }
      return query;
    }
  }

  return BaseResolver;
}

