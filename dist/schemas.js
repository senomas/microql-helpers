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
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
let Commit = class Commit {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Commit.prototype, "hash", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Commit.prototype, "abbrevHash", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Commit.prototype, "subject", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Commit.prototype, "authorName", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], Commit.prototype, "authorDate", void 0);
Commit = __decorate([
    type_graphql_1.ObjectType()
], Commit);
exports.Commit = Commit;
let ServerInfo = class ServerInfo {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ServerInfo.prototype, "host", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], ServerInfo.prototype, "time", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], ServerInfo.prototype, "buildTime", void 0);
__decorate([
    type_graphql_1.Field(type => [Commit]),
    __metadata("design:type", Array)
], ServerInfo.prototype, "commits", void 0);
__decorate([
    type_graphql_1.Field(type => [Error], { nullable: true }),
    __metadata("design:type", Array)
], ServerInfo.prototype, "errors", void 0);
ServerInfo = __decorate([
    type_graphql_1.ObjectType()
], ServerInfo);
exports.ServerInfo = ServerInfo;
let Error = class Error {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], Error.prototype, "path", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], Error.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], Error.prototype, "value", void 0);
Error = __decorate([
    type_graphql_1.ObjectType()
], Error);
exports.Error = Error;
var OrderByType;
(function (OrderByType) {
    OrderByType["asc"] = "asc";
    OrderByType["desc"] = "desc";
})(OrderByType = exports.OrderByType || (exports.OrderByType = {}));
type_graphql_1.registerEnumType(OrderByType, { name: 'OrderByType' });
let UpdateResponse = class UpdateResponse {
};
__decorate([
    type_graphql_1.Field(type => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateResponse.prototype, "matched", void 0);
__decorate([
    type_graphql_1.Field(type => type_graphql_1.Int),
    __metadata("design:type", Number)
], UpdateResponse.prototype, "modified", void 0);
__decorate([
    type_graphql_1.Field(type => [Error], { nullable: true }),
    __metadata("design:type", Array)
], UpdateResponse.prototype, "errors", void 0);
UpdateResponse = __decorate([
    type_graphql_1.ObjectType()
], UpdateResponse);
exports.UpdateResponse = UpdateResponse;
let DeleteResponse = class DeleteResponse {
};
__decorate([
    type_graphql_1.Field(type => type_graphql_1.Int),
    __metadata("design:type", Number)
], DeleteResponse.prototype, "deleted", void 0);
__decorate([
    type_graphql_1.Field(type => [Error], { nullable: true }),
    __metadata("design:type", Array)
], DeleteResponse.prototype, "errors", void 0);
DeleteResponse = __decorate([
    type_graphql_1.ObjectType()
], DeleteResponse);
exports.DeleteResponse = DeleteResponse;
//# sourceMappingURL=schemas.js.map