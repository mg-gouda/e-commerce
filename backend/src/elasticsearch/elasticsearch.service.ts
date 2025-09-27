import { Injectable } from '@nestjs/common';
import { ElasticsearchService as ESService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchService {
  constructor(private readonly esService: ESService) {}

  async createIndex(index: string) {
    const exists = await this.esService.indices.exists({ index });
    if (!exists) {
      await this.esService.indices.create({ index });
    }
  }

  async indexDocument(index: string, id: string, document: any) {
    return await this.esService.index({
      index,
      id,
      body: document,
    });
  }

  async searchDocuments(index: string, query: any) {
    return await this.esService.search({
      index,
      body: {
        query,
      },
    });
  }

  async updateDocument(index: string, id: string, document: any) {
    return await this.esService.update({
      index,
      id,
      body: {
        doc: document,
      },
    });
  }

  async deleteDocument(index: string, id: string) {
    return await this.esService.delete({
      index,
      id,
    });
  }

  async searchProducts(searchTerm: string, filters?: any) {
    const query: any = {
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
      const range: any = {};
      if (filters.priceMin) range.gte = filters.priceMin;
      if (filters.priceMax) range.lte = filters.priceMax;
      query.bool.filter.push({
        range: { price: range },
      });
    }

    return await this.searchDocuments('products', query);
  }
}