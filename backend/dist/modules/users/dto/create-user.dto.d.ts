export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    mfaRequired?: boolean;
}
export declare class CreateUserDtoClass {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    mfaRequired?: boolean;
}
