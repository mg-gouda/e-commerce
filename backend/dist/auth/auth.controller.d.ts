import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
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
            role: import("../entities/user.entity").UserRole;
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
    getProfile(req: any): any;
}
