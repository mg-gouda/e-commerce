import { CategoriesService } from './categories.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("../entities").Category>;
    findAll(): Promise<import("../entities").Category[]>;
    findOne(id: string): Promise<import("../entities").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("../entities").Category>;
    remove(id: string): Promise<void>;
}
