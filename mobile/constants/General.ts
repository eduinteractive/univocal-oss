export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>?/|\\`~]).{8,}$/;
export const MAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export enum AuthFormState {
    SignIn,
    SignUp,
    ForgotPassword,
}