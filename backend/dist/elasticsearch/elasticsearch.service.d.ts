import { ElasticsearchService as ESService } from '@nestjs/elasticsearch';
export declare class ElasticsearchService {
    private readonly esService;
    constructor(esService: ESService);
    createIndex(index: string): Promise<void>;
    indexDocument(index: string, id: string, document: any): Promise<import("node_modules/@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    searchDocuments(index: string, query: any): Promise<import("node_modules/@elastic/elasticsearch/lib/api/types").SearchResponse<unknown, Record<string, import("node_modules/@elastic/elasticsearch/lib/api/types").AggregationsAggregate>>>;
    updateDocument(index: string, id: string, document: any): Promise<import("node_modules/@elastic/elasticsearch/lib/api/types").UpdateResponse<unknown>>;
    deleteDocument(index: string, id: string): Promise<import("node_modules/@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    searchProducts(searchTerm: string, filters?: any): Promise<import("node_modules/@elastic/elasticsearch/lib/api/types").SearchResponse<unknown, Record<string, import("node_modules/@elastic/elasticsearch/lib/api/types").AggregationsAggregate>>>;
}
