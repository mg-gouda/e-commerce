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
exports.ElasticsearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
let ElasticsearchService = class ElasticsearchService {
    esService;
    constructor(esService) {
        this.esService = esService;
    }
    async createIndex(index) {
        const exists = await this.esService.indices.exists({ index });
        if (!exists) {
            await this.esService.indices.create({ index });
        }
    }
    async indexDocument(index, id, document) {
        return await this.esService.index({
            index,
            id,
            body: document,
        });
    }
    async searchDocuments(index, query) {
        return await this.esService.search({
            index,
            body: {
                query,
            },
        });
    }
    async updateDocument(index, id, document) {
        return await this.esService.update({
            index,
            id,
            body: {
                doc: document,
            },
        });
    }
    async deleteDocument(index, id) {
        return await this.esService.delete({
            index,
            id,
        });
    }
    async searchProducts(searchTerm, filters) {
        const query = {
            bool: {
                must: [],
                filter: [],
            },
        };
        if (searchTerm) {
            query.bool.must.push({
                multi_match: {
                    query: searchTerm,
                    fields: ['name^2', 'description'],
                },
            });
        }
        if (filters?.category) {
            query.bool.filter.push({
                term: { category_id: filters.category },
            });
        }
        if (filters?.priceMin || filters?.priceMax) {
            const range = {};
            if (filters.priceMin)
                range.gte = filters.priceMin;
            if (filters.priceMax)
                range.lte = filters.priceMax;
            query.bool.filter.push({
                range: { price: range },
            });
        }
        return await this.searchDocuments('products', query);
    }
};
exports.ElasticsearchService = ElasticsearchService;
exports.ElasticsearchService = ElasticsearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService])
], ElasticsearchService);
//# sourceMappingURL=elasticsearch.service.js.map