export declare class ValidationService {
    validateEmployeeId(employeeId: string): string;
    validateDepartment(department?: string): string;
    validateEmail(email: string): string;
    validatePassword(password: string): void;
    validatePhone(phone: string): boolean;
    validateUsername(username: string): string;
    validateName(name: string, fieldName: string): string;
    validateJobTitle(jobTitle?: string): string;
    validateRegisterInput(dto: any): void;
}
