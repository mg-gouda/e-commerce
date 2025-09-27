import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
export interface CreateCategoryDto {
    name: string;
}
export interface UpdateCategoryDto {
    name?: string;
}
export declare class CategoriesService {
    private categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<void>;
}
