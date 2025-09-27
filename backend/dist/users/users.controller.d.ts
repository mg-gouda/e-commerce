import { UsersService } from './users.service';
import { UpdateUserProfileDto, AdminUpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCurrentUser(req: any): Promise<import("../entities/user.entity").User>;
    updateProfile(req: any, updateUserDto: UpdateUserProfileDto): Promise<import("../entities/user.entity").User>;
    findAll(page?: number, limit?: number): Promise<{
        users: import("../entities/user.entity").User[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
    update(id: string, updateUserDto: AdminUpdateUserDto): Promise<import("../entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
