import { MyException } from "./my.exception";

export class BusinessException extends MyException {}
export class ValidationException extends MyException {}
export class AppSecurityException extends MyException {}
export class InfrastructureException extends MyException {}
export class ThirdPartyException extends MyException {}
export class UnknownException extends MyException {}
