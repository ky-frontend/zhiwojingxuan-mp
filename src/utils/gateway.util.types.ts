import type { DomainKey } from '@ky-frontend/common';

export type OptionsType = {
  baseURL: string;
  headers: Record<string, string>;
  loginLoseEffect?: () => void;
  interceptorsRequest?: () => any;
  interceptorsResponse?: (config: any) => any;
  defaultApiLevel: 'None' | 'Anonym' | 'User' | 'Admin';
};

export type KYResponseType<R> = {
  code: number;
  message: string;
  domain: DomainKey | '';
  data: R;
};

export type GateWayType = <
  T,
  R = T[keyof T] extends { data: object } ? T[keyof T]['data'] : undefined,
>(params: {
  path: keyof T;
  method: T[keyof T] extends { method: 'get' | 'post' | 'delete' | 'put' }
    ? T[keyof T]['method']
    : 'get';
  params: T[keyof T] extends { params: object } ? T[keyof T]['params'] : {};
  apiLevel?: T[keyof T] extends { apiLevel: 'None' | 'Anonym' | 'User' | 'Admin' }
    ? T[keyof T]['apiLevel']
    : 'None';
}) => Promise<KYResponseType<R>>;
