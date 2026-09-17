declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
  export function getApp(): any;
}

declare module 'firebase/auth' {
  export function getAuth(app?: any): any;
  export class RecaptchaVerifier {
    constructor(auth: any, container: string | HTMLElement, options: any);
    clear(): void;
    render(): Promise<any>;
    verify(): Promise<any>;
  }
  export function signInWithPhoneNumber(auth: any, phoneNumber: string, appVerifier: any): Promise<ConfirmationResult>;
  export interface ConfirmationResult {
    confirm(verificationCode: string): Promise<any>;
  }
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function updateProfile(user: any, profile: { displayName?: string; photoURL?: string }): Promise<void>;
}
