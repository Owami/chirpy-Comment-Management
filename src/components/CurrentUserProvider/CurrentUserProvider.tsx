import { QueryHookOptions } from '@apollo/client';
import Cookies from 'js-cookie';
import * as React from 'react';

import { UserByPkQuery, UserByPkQueryVariables, useUserByPkQuery } from '$/graphql/generated/user';
import { ssrMode } from '$/utilities/env';

import { AUTH_COOKIE_NAME } from '$shared/constants';

import { CurrentUserContext, CurrentUserContextType } from './CurrentUserContext';

export type CurrentUserProviderProps = React.PropsWithChildren<{
  apolloBaseOptions?: QueryHookOptions<UserByPkQuery, UserByPkQueryVariables>;
}>;

export function CurrentUserProvider(props: CurrentUserProviderProps): JSX.Element {
  const { data, refetch, ...restProps } = useUserByPkQuery({
    ...props.apolloBaseOptions,
    variables: {
      id: getUserId(),
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const value = React.useMemo<CurrentUserContextType>(
    () => ({
      ...restProps,
      ...data?.userByPk,
      refetchData: () =>
        refetch({
          id: getUserId(),
        }),
      isLogin: !!data?.userByPk?.id,
    }),
    [data, restProps, refetch],
  );

  return <CurrentUserContext.Provider value={value}>{props.children}</CurrentUserContext.Provider>;
}

function getUserId(): string {
  // TODO: Fix reload page user un-authenticated.
  if (ssrMode) {
    return '';
  }
  const [, encryptedPayload] = (Cookies.get(AUTH_COOKIE_NAME) || '').split('.');
  if (!encryptedPayload) {
    return '';
  }
  const payloadString = atob(encryptedPayload);
  return JSON.parse(payloadString).sub;
}
