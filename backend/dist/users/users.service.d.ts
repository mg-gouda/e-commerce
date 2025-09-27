import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserProfileDto, AdminUpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | undefined>;
    updateProfile(userId: string, updateUserDto: UpdateUserProfileDto): Promise<User>;
    updateUser(id: string, updateUserDto: AdminUpdateUserDto): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
