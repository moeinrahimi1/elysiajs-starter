// import axios from 'axios';
import { env } from "@/config";
import * as Kavenegar from "kavenegar";
// import * as Sentry from '@sentry/node';

export class SMSProvider {
  constructor() {}

  async sendSMS(mobile: string, code: string): Promise<any> {
    const api = Kavenegar.KavenegarApi({ apikey: env.KAVE_NEGAR });
    api.VerifyLookup(
      {
        receptor: mobile,
        template: "otp",
        token: code,
      },
      (res, status, message) => {
        console.log(res, status, message);
      }
    );
  }
}
