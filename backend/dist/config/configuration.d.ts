declare const _default: () => {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expiration: string;
    };
    app: {
        port: number;
        env: string;
        corsOrigin: string;
    };
    security: {
        bcryptSaltRounds: number;
    };
};
export default _default;
