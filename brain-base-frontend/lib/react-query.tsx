"use client";

import { useState, type ReactNode } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AxiosResponse } from "axios";

import { deleteCookie } from "@/utils/cookie";

export default function TanstackQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // fresh cache 30 second
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: (error: any /* eslint-disable-line*/) => {
            if (error.isAxiosError && error.response) {
              const response: AxiosResponse = error.response;

              if (response.status === 403 || response.status === 401) {
                localStorage.clear();
                deleteCookie("token");
                window.location.href = "/auth/login";
              }
            }
            console.error(error);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
