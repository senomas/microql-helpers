import 'reflect-metadata';
import { GraphQLExtension } from 'apollo-server-express';
export declare class BasicLogging extends GraphQLExtension {
    requestDidStart(o: any): void;
    willSendResponse({ context, graphqlResponse }: {
        context: any;
        graphqlResponse: any;
    }): void;
}
export declare function bootstrap({ resolvers, init }: {
    resolvers: any;
    init: () => void;
}): Promise<void>;
