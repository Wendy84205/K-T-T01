declare const _default: (() => {
    secret: string;
    accessTokenExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
    cookieName: string;
    cookieDomain: string;
    cookieSecure: boolean;
    cookieHttpOnly: boolean;
    cookieSameSite: string;
    cookieMaxAge: number;
    issuer: string;
    audience: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    accessTokenExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
    cookieName: string;
    cookieDomain: string;
    cookieSecure: boolean;
    cookieHttpOnly: boolean;
    cookieSameSite: string;
    cookieMaxAge: number;
    issuer: string;
    audience: string;
}>;
export default _default;
