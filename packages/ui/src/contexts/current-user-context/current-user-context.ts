import { Nullable } from '@chirpy-dev/types';
import { asyncNoop } from '@chirpy-dev/utils';
import { Session } from 'next-auth';
import * as React from 'react';

export type UserData = Nullable<Session['user']>;

export type RefetchUser = (data?: any) => Promise<Session | null>;

export type CurrentUserContextType = {
  refetchUser: RefetchUser;
  loading: boolean;
  isSignIn: boolean;
  // We have a preview widget in home page,
  // we need to turn off some features if we are in preview mode
  isPreview?: true;
  isPaid?: boolean;
  data: UserData;
};

export const EMPTY_CURRENT_USER_CONTEXT: CurrentUserContextType = {
  isSignIn: false,
  data: {},
  loading: false,
  refetchUser: asyncNoop as unknown as RefetchUser,
};

export const CurrentUserContext = React.createContext<CurrentUserContextType>(
  EMPTY_CURRENT_USER_CONTEXT,
);
