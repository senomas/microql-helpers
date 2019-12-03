export interface CreateBaseResolverOption {
    suffix: string;
    suffixPlurals?: string;
    suffixCapitalize?: string;
    suffixCapitalizePlurals?: string;
    suffixCreate?: string;
    suffixUpdate?: string;
    queryFilters?: null;
    typeCls: any;
    partialTypeCls: any;
    createInput: any;
    updateInput: any;
    filterInput: any;
    orderByInput: any;
}
export declare const regexDupKey: RegExp;
export interface IBaseResolver {
}
export declare function createBaseResolver(opt: CreateBaseResolverOption): IBaseResolver;
