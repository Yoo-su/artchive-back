import { Request } from 'express';
import { UserService } from '../services/user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: Request): {
        message: string;
    };
    getMyPosts(req: Request): Promise<{
        success: boolean;
        data: import("../../book/entities/used-book-post.entity").UsedBookPost[];
    }>;
}
