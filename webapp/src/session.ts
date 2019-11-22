import requests from './requests';

export interface UserInfo {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  // eslint-disable-next-line camelcase
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  // eslint-disable-next-line camelcase
  premium_type?: number;
}

let userInfo: UserInfo | undefined;
export default async function getUserInfo() {
  if (!userInfo) {
    userInfo = await requests.get<UserInfo>('/api/user/info')
      .then(x => x.data)
      .catch(_ => undefined);
  }
  return userInfo;
}

export function login(redirectUrl?: string) {
  window.location.replace(`/api/login?redirectUrl=${encodeURIComponent(redirectUrl || window.location.toString())}`);
}
