import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sort') sort?: string,
  ) {
    console.log('🔥 Frontend requested /products endpoint with filters:', {
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice,
      sort
    });

    const filters = {
      search,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    };

    return this.productsService.findAll(page, limit, filters);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    console.log('🔥 Frontend requested /products/search endpoint with query:', query);

    const filters = {
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };

    return this.productsService.search(query || '', Number(page), Number(limit), filters);
  }

  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log(`🔥 Frontend requested /products/category/${categoryId} endpoint`);
    return this.productsService.findByCategory(categoryId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(`🔥 Frontend requested /products/${id} endpoint`);
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    console.log('🔥 Frontend requested POST /products endpoint');
    return this.productsService.create(createProductDto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', UploadService.getMulterOptions()))
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(`🔥 Frontend requested POST /products/${id}/image endpoint`);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const imageUrl = this.uploadService.getFileUrl(file.filename);

    const updatedProduct = await this.productsService.update(id, {
      image_url: imageUrl,
    });

    return {
      message: 'Image uploaded successfully',
      imageUrl,
      product: updatedProduct,
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    console.log(`🔥 Frontend requested PUT /products/${id} endpoint`);
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log(`🔥 Frontend requested DELETE /products/${id} endpoint`);
    return this.productsService.remove(id);
  }

  // Inventory Management Endpoints

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body('stock') stock: number) {
    console.log(`🔥 Admin requested PATCH /products/${id}/stock endpoint`);
    return this.productsService.updateStock(id, stock);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/stock/adjust')
  adjustStock(@Param('id') id: string, @Body('adjustment') adjustment: number) {
    console.log(`🔥 Admin requested PATCH /products/${id}/stock/adjust endpoint`);
    return this.productsService.adjustStock(id, adjustment);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('inventory/low-stock')
  getLowStockProducts(@Query('threshold') threshold?: number) {
    console.log('🔥 Admin requested GET /products/inventory/low-stock endpoint');
    return this.productsService.getLowStockProducts(threshold ? Number(threshold) : 10);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('inventory/out-of-stock')
  getOutOfStockProducts() {
    console.log('🔥 Admin requested GET /products/inventory/out-of-stock endpoint');
    return this.productsService.getOutOfStockProducts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('inventory/stats')
  getInventoryStats() {
    console.log('🔥 Admin requested GET /products/inventory/stats endpoint');
    return this.productsService.getInventoryStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('inventory/bulk')
  bulkUpdateStock(@Body() updates: Array<{ id: string; stock: number }>) {
    console.log('🔥 Admin requested PATCH /products/inventory/bulk endpoint');
    return this.productsService.bulkUpdateStock(updates);
  }

  @Get(':id/stock/check')
  async checkStockAvailability(
    @Param('id') id: string,
    @Query('quantity') quantity: number,
  ) {
    console.log(`🔥 Frontend requested GET /products/${id}/stock/check endpoint`);
    const available = await this.productsService.checkStockAvailability(id, Number(quantity));
    return { available, productId: id, requestedQuantity: Number(quantity) };
  }

  // Product Recommendation Endpoints

  @Get('recommendations/related/:id')
  async getRelatedProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    console.log(`🔥 Frontend requested GET /products/recommendations/related/${id} endpoint`);
    return this.productsService.getRelatedProducts(id, limit ? Number(limit) : 6);
  }

  @Get('recommendations/trending')
  async getTrendingProducts(@Query('limit') limit?: number) {
    console.log('🔥 Frontend requested GET /products/recommendations/trending endpoint');
    return this.productsService.getTrendingProducts(limit ? Number(limit) : 10);
  }

  @Get('recommendations/featured')
  async getFeaturedProducts(@Query('limit') limit?: number) {
    console.log('🔥 Frontend requested GET /products/recommendations/featured endpoint');
    return this.productsService.getFeaturedProducts(limit ? Number(limit) : 8);
  }

  @Get('recommendations/new-arrivals')
  async getNewArrivals(@Query('limit') limit?: number) {
    console.log('🔥 Frontend requested GET /products/recommendations/new-arrivals endpoint');
    return this.productsService.getNewArrivals(limit ? Number(limit) : 12);
  }

  @Get('recommendations/same-brand/:id')
  async getProductsBySameBrand(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    console.log(`🔥 Frontend requested GET /products/recommendations/same-brand/${id} endpoint`);
    return this.productsService.getProductsBySameBrand(id, limit ? Number(limit) : 6);
  }

  @Get('recommendations/similar-price/:id')
  async getSimilarPriceProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    console.log(`🔥 Frontend requested GET /products/recommendations/similar-price/${id} endpoint`);
    return this.productsService.getSimilarPriceProducts(id, limit ? Number(limit) : 6);
  }

  @Get('recommendations/frequently-bought-together/:id')
  async getFrequentlyBoughtTogether(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    console.log(`🔥 Frontend requested GET /products/recommendations/frequently-bought-together/${id} endpoint`);
    return this.productsService.getFrequentlyBoughtTogether(id, limit ? Number(limit) : 4);
  }

  @Get('recommendations/personalized')
  @UseGuards(JwtAuthGuard)
  async getPersonalizedRecommendations(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    console.log('🔥 Frontend requested GET /products/recommendations/personalized endpoint');
    return this.productsService.getPersonalizedRecommendations(req.user.id, limit ? Number(limit) : 10);
  }
}