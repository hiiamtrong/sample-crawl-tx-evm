import { NetworkEnum } from 'src/network/network.constant';

export interface MailData<T = never> {
  to: string;
  data: T;
}

export interface MailDataWithTemplate<T = never> extends MailData<T> {
  jobName: string;
}

export type UserVerifyEmailData = {
  otp: string;
  otpExpiresIn: string;
  redirectUrl: string;
};

export type OperatorVerifyEmailData = UserVerifyEmailData;

export type UserResetPasswordData = {
  otp: string;
  otpExpiresIn: string;
  redirectUrl?: string;
};

export type UserNewLoginData = UserVerifyEmailData;

export type UserNewTransactionData = {
  otp: string;
  otpExpiresIn: string;
};

export type OperatorResetPasswordData = {
  otp: string;
  otpExpiresIn: string;
  redirectUrl?: string;
};

export type SystemConfigFundHolderAccountRequestData = {
  network: NetworkEnum;
  otp: string;
  otpExpiresIn: string;
};
