import { ClassType } from "type-graphql";
export declare function Partial<TItem>(TItemClass: ClassType<TItem>): any;
export declare function CreateUpdateResult<TItem>(TItemClass: ClassType<TItem>): any;
export declare class Commit {
    hash: string;
    abbrevHash: string;
    subject: string;
    authorName: string;
    authorDate: Date;
}
export declare class ServerInfo {
    host: string;
    time: Date;
    buildTime: Date;
    commits: Commit[];
    errors?: Error[];
}
export declare class Error {
    path?: string;
    name?: string;
    value?: string;
}
export declare enum OrderByType {
    asc = "asc",
    desc = "desc"
}
export declare class CreateResponse {
    id?: string;
    errors?: Error[];
}
export declare class UpdateResponse {
    matched: number;
    modified: number;
    errors?: Error[];
}
export declare class DeleteResponse {
    deleted: number;
    errors?: Error[];
}
