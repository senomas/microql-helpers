import 'reflect-metadata';
import { GraphQLExtension } from 'apollo-server-express';
export declare class BasicLogging extends GraphQLExtension {
    requestDidStart(o: any): void;
    willSendResponse({ context, graphqlResponse }: {
        context: any;
        graphqlResponse: any;
    }): void;
}
export declare function bootstrap({ resolvers, init, context }: {
    resolvers?: any;
    init?: () => void;
    context?: (any: any) => void;
}): Promise<void>;
