'use client';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { ReactNode } from 'react';

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
        },
    },
});

export function ApolloProvider({ children }: { children: ReactNode }) {
    return (
        <BaseApolloProvider client={apolloClient}>
            {children}
        </BaseApolloProvider>
    );
}
