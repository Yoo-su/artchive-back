declare const JwtRefreshStrategy_base: new (...args: any) => any;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor();
    validate(payload: any): Promise<{
        sub: any;
        nickname: any;
    }>;
}
export {};
