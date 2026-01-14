declare const _default: (() => {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
    templateDir: string;
    verificationTokenExpiry: number;
    resetTokenExpiry: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
    templateDir: string;
    verificationTokenExpiry: number;
    resetTokenExpiry: number;
}>;
export default _default;
