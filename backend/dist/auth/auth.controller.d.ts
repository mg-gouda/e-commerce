import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
            reset_token: string;
            reset_token_expires: Date;
            created_at: Date;
            updated_at: Date;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
            reset_token: string;
            reset_token_expires: Date;
            created_at: Date;
            updated_at: Date;
        };
        token: string;
    }>;
    getProfile(req: any): any;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
