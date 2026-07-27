import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query"
import type { AxiosRequestConfig } from "axios"

/*nel caso di number o string
?cursor=cursore_stringa_o_numero
nel caso del record, per esempio {cursor1: "alex", cursor2: '0'}
?cursor1=alex&cursor2=0*/
type CursorType = number | string | Record<string, number | string>

type CursorPaginatedApiHookOptions = {
    url: string,
    initialCursor: CursorType,
    queryKey: Array<string>,
    enabled: boolean,
}

type HookSubHooks = {
    beforeQuery: {
        setConfig: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
    }
}

type CursorPaginatedApiHook_ReturnType<TItem> = {
    items: TItem[]
    fetchNext: () => Promise<unknown>
    isLoading: boolean
    isFetchingNext: boolean
    error: unknown
    hasMore: boolean
    totalRecords: number | 'loading'
    refetch: () => Promise<unknown>,
    unwrappedLevel: {
      infiniteQueryApiObj: UseInfiniteQueryResult<InfiniteData<any, unknown>, Error>
    },
}

export type {
    CursorType,
    CursorPaginatedApiHookOptions,
    HookSubHooks,
    CursorPaginatedApiHook_ReturnType
}