import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    type ReactNode
} from "react"

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useMatch } from "react-router-dom"

import { SERVER_BASE_URL } from "../utils/objects/constants"
import { useAppAuth } from "./AppAuthContext"
import { appRoutes } from "../utils/objects/objects"
import type { friendDataFromBackend } from "../utils/types/friends"
import { setAuthorizationHeader } from "../utils/functions/utils/hooks/cursorPaginationHook"

type fListPage = Array<friendDataFromBackend>

type FriendsContextValue = {
    friends: friendDataFromBackend[]
    fetchNext: () => void
    error: unknown
    isLoading: boolean
    isFetchingNext: boolean
    totalRecords: number | 'loading'
    hasMore: boolean
    isFetching: boolean
    refetch: () => void
    getUiPage: (i: number) => fListPage
    uiPageSize: number
    methods: {
        addFriendManually: (friend: friendDataFromBackend) => void
        removeFriendManually: (relationId: string) => void
    }
}

const FriendsContext = createContext<FriendsContextValue>({
    friends: [],
    fetchNext: () => { },
    error: null,
    isLoading: false,
    isFetchingNext: false,
    totalRecords: 'loading',
    hasMore: true,
    isFetching: false,
    refetch: () => { },
    getUiPage: () => [],
    uiPageSize: 20,
    methods: {
        addFriendManually: () => { },
        removeFriendManually: () => { }
    }
})

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
    const apiUrl = `${SERVER_BASE_URL}/friends/friendsList`
    const uiPageSize = 20

    const { firstAuth } = useAppAuth()
    const queryClient = useQueryClient()

    const fListQKey = useMemo(() => {
        if (firstAuth.status !== 'authenticated') return ['friends', 'anonymous']

        return [
            'friends',
            firstAuth.user.email,
            firstAuth.user.uid,
            firstAuth.user.providerId
        ]
    }, [firstAuth])

    const isFriendsPage = useMatch(`${appRoutes.HOMEPAGE.ROOT}/${appRoutes.HOMEPAGE.SECTIONS.FRIENDS}`) !== null
    const isWorkingRoom = useMatch("/workingRoom/:roomId/*") !== null

    const enabled = isFriendsPage || isWorkingRoom

    const query = useInfiniteQuery({
        queryKey: fListQKey,
        initialPageParam: { cursor1: '', cursor2: '0' },
        enabled,
        staleTime: 0,

        queryFn: async ({ pageParam }) => {
            let config: any = {
                params: pageParam
            }

            config = await setAuthorizationHeader(config)

            const res = await axios.get(apiUrl, config)
            const data = res.data

            if (data?.error) {
                throw new Error(data.error)
            }

            return data
        },

        getNextPageParam: (lastPage: any) => {
            return lastPage.isTheLastPage ? undefined : lastPage.nextCursor
        }
    })

    const items = useMemo(() => {
        if (!query.data) return []

        return query.data.pages.flatMap((p: any) => p.result)
    }, [query.data])

    const totalRecords = useMemo(() => {
        return query.data?.pages?.[0]?.totalRecords ?? 'loading'
    }, [query.data])

    const sortedPages = useMemo(() => {
        if (totalRecords === 'loading') return []

        const ordered = [...items].sort((a, b) =>
            a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1
        )

        const pages: fListPage[] = []

        for (let i = 0; i < ordered.length; i += uiPageSize) {
            pages.push(ordered.slice(i, i + uiPageSize))
        }

        return pages
    }, [items, totalRecords, uiPageSize])

    const addFriendManually = useCallback((friend: friendDataFromBackend) => {
        queryClient.setQueryData(fListQKey, (old: any) => {
            if (!old) return old

            return {
                ...old,
                pages: old.pages.map((page: any, i: number) => {
                    if (i === 0) {
                        return {
                            ...page,
                            result: [friend, ...page.result],
                            totalRecords:
                                typeof page.totalRecords === 'number'
                                    ? page.totalRecords + 1
                                    : page.totalRecords
                        }
                    }
                    return page
                })
            }
        })
    }, [queryClient, fListQKey])

    const removeFriendManually = useCallback((relationId: string) => {
        queryClient.setQueryData(fListQKey, (old: any) => {
            if (!old) return old

            return {
                ...old,
                pages: old.pages.map((page: any, i: number) => {
                    if (i === 0) {
                        return {
                            ...page,
                            result: page.result.filter(
                                (f: friendDataFromBackend) => f.relationId !== relationId
                            ),
                            totalRecords:
                                typeof page.totalRecords === 'number'
                                    ? page.totalRecords - 1
                                    : page.totalRecords
                        }
                    }
                    return page
                })
            }
        })
    }, [queryClient, fListQKey])

    const contextValue = useMemo(() => ({
        friends: items,
        fetchNext: query.fetchNextPage,
        error: query.error,
        isLoading: query.isLoading,
        isFetchingNext: query.isFetchingNextPage,
        totalRecords,
        hasMore: query.hasNextPage,
        isFetching: query.isFetching,
        refetch: query.refetch,
        getUiPage: (i: number) => sortedPages[i] ?? [],
        uiPageSize,
        methods: {
            addFriendManually,
            removeFriendManually
        }
    }), [
        items,
        query.fetchNextPage,
        query.error,
        query.isLoading,
        query.isFetchingNextPage,
        query.hasNextPage,
        query.isFetching,
        query.refetch,
        totalRecords,
        sortedPages,
        uiPageSize,
        addFriendManually,
        removeFriendManually
    ])

    return (
        <FriendsContext.Provider value={contextValue}>
            {children}
        </FriendsContext.Provider>
    )
}

export const useFriendsContext = () => useContext(FriendsContext)