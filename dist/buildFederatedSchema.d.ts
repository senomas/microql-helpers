import { GraphQLResolverMap } from "apollo-graphql";
import { BuildSchemaOptions } from 'type-graphql';
export declare function buildFederatedSchema(options: Omit<BuildSchemaOptions, "skipCheck">, referenceResolvers?: GraphQLResolverMap<any>): Promise<import("graphql").GraphQLSchema>;
