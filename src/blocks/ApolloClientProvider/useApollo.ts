import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
  split,
  ApolloLink,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { persistCache, PersistentStorage, LocalForageWrapper } from 'apollo3-cache-persist';
import { PersistedData } from 'apollo3-cache-persist/types';
import * as localForage from 'localforage';
import { useSession } from 'next-auth/client';
import preval from 'preval.macro';
import * as React from 'react';
import { usePromise } from 'react-use';

import { isENVDev } from '$/server/utilities/env';
import { ssrMode } from '$/utilities/env';

export function useApollo(initialState?: any): ApolloClient<NormalizedCacheObject> {
  const [session] = useSession();
  const [client, setClient] = React.useState<ApolloClient<NormalizedCacheObject>>(() =>
    getApolloClient(session?.hasuraToken, initialState),
  );
  const mounted = usePromise();
  React.useEffect(() => {
    if (!session?.hasuraToken) {
      return;
    }
    setClient(getApolloClient(session.hasuraToken, initialState));
  }, [session?.hasuraToken, initialState, mounted]);
  return client;
}

function getApolloClient(
  hasuraToken = '',
  initialState: any = null,
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = createApolloClient(hasuraToken);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  return _apolloClient;
}

// Used in server
const getHttpLink = (hasuraToken: string) => {
  const link = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_HASURA_HTTP_ORIGIN}/v1/graphql`,
    credentials: `include`,
    headers: getHeaders(hasuraToken), // auth token is fetched on the server side
  });
  return link;
};

// Used in browser
const getWSLink = (hasuraToken: string) => {
  return new WebSocketLink({
    uri: `${process.env.NEXT_PUBLIC_HASURA_WS_ORIGIN}/v1/graphql`,
    options: {
      lazy: true,
      reconnect: true,
      connectionParams: () => {
        return {
          headers: getHeaders(hasuraToken),
        };
      },
    },
  });
};

function getHeaders(hasuraToken: string) {
  return {
    authorization: `Bearer ${
      hasuraToken ||
      preval`
      process.env.HASH_KEY = ${process.env.HASH_KEY};
      module.exports = require("./anonymous-token.js");
    `
    }`,
  };
}

let cache: InMemoryCache;

const createApolloClient = (hasuraToken: string) => {
  let link: ApolloLink;
  const httpLink = getHttpLink(hasuraToken);
  if (ssrMode) {
    link = httpLink;
  } else {
    const wsLink = getWSLink(hasuraToken);
    link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      httpLink,
    );
  }
  if (!cache) {
    cache = new InMemoryCache();
    if (!ssrMode) {
      persistCache({
        cache,
        storage: new LocalForageWrapper(localForage) as PersistentStorage<
          PersistedData<NormalizedCacheObject>
        >,
        debug: isENVDev,
      });
    }
  }

  return new ApolloClient({
    link,
    cache,
    ssrMode,
  });
};