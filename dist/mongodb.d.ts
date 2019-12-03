import { Collection, Cursor, Db } from "mongodb";
export declare class MongoModel {
    private mongodb;
    collection: Collection;
    db: Db;
    constructor(mongodb: Mongodb, collection: Collection);
    loadKey: (data: any) => any;
    loadEnhance: (data: any) => any;
    insertOne(value: any, options?: any): Promise<any>;
    updateOne(filter: any, update: any, options?: any): Promise<any>;
    updateMany(filter: any, update: any, options?: any): Promise<any>;
    deleteMany(filter: any, options?: any): Promise<any>;
    findOne(query: any, options?: any): Promise<any>;
    count(query: any, options?: any): any;
    find(query: any, options?: any): Cursor;
    load(data: any): Promise<any>;
}
export interface MongoModels {
    [key: string]: MongoModel;
}
export declare class Mongodb {
    db: Db;
    models: MongoModels;
    init(config: any): Promise<void>;
    create(name: any, options?: any): Promise<MongoModel>;
}
export declare const mongodb: Mongodb;
