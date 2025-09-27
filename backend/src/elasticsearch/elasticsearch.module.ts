import { Module, Global } from '@nestjs/common';
import { ElasticsearchModule as ESModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';

@Global()
@Module({
  imports: [
    ESModule.register({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    }),
  ],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}