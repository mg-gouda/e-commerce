import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(createUserDto: CreateUserDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: UserRole;
            created_at: Date;
            updated_at: Date;
            orders: import("../entities").Order[];
            reviews: import("../entities").Review[];
            carts: import("../entities").Cart[];
            wishlists: import("../entities").Wishlist[];
            loyaltyPoints: import("../entities").LoyaltyPoint[];
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: UserRole;
            created_at: Date;
            updated_at: Date;
            orders: import("../entities").Order[];
            reviews: import("../entities").Review[];
            carts: import("../entities").Cart[];
            wishlists: import("../entities").Wishlist[];
            loyaltyPoints: import("../entities").LoyaltyPoint[];
        };
        token: string;
    }>;
    validateUser(email: string, password: string): Promise<any>;
    findById(id: string): Promise<User | null>;
}
