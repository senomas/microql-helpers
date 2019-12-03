import { MiddlewareFn, MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';
export declare class LoggerMiddleware implements MiddlewareInterface<any> {
    use({ context, info }: ResolverData<any>, next: NextFn): Promise<any>;
}
export declare const LoggerResolverMiddleware: MiddlewareFn<any>;
