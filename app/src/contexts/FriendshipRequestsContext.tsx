import { createContext, useContext, type ReactNode } from "react"
import type { receivedFriendshipRequestFromBackend, sentFriendshipRequestFromBackend } from "../utils/types/friends"
import { useCursorPaginatedAPI } from "../hooks/useCursorPaginatedAPI"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { useAppAuth } from "./AppAuthContext"
import { useQueryClient } from "@tanstack/react-query"
import type { CursorPaginatedApiHook_ReturnType } from "../utils/types/hooks/useCursorPaginatedAPI.types"
import type { User } from "firebase/auth"
import { setAuthorizationHeader } from "../utils/functions/utils/hooks/cursorPaginationHook"

type receivedReqsMethodsCallbackDescriptors = {
    'addReceivedReq': (request: receivedFriendshipRequestFromBackend) => void,
    'cancelReceivedReq': (requestId: string) => void
}

type sentReqsMethodsCallbackDescriptors = {
    'addSentReq': (request: sentFriendshipRequestFromBackend) => void,
    'cancelSentReq': (requestId: string) => void,
}

interface ContextProps {
    apiHooks: {
        sentReqs: CursorPaginatedApiHook_ReturnType<sentFriendshipRequestFromBackend>,
        recdReqs: CursorPaginatedApiHook_ReturnType<receivedFriendshipRequestFromBackend>
    }

    receivedReqsMethods: receivedReqsMethodsCallbackDescriptors
    sentReqsMethods: sentReqsMethodsCallbackDescriptors
}

const FriendshipRequestsContext = createContext<ContextProps>({
    apiHooks: {
        sentReqs: {
            error: null, hasMore: false, isFetchingNext: false, isLoading: false,
            items: [], totalRecords: 'loading', fetchNext: async () => { }, refetch: async () => { },
            unwrappedLevel: ({} as any)
        },
        recdReqs: {
            error: null, hasMore: false, isFetchingNext: false, isLoading: false,
            items: [], totalRecords: 'loading', fetchNext: async () => { }, refetch: async () => { },
            unwrappedLevel: ({} as any)
        }
    },

    receivedReqsMethods: {
        addReceivedReq: () => { },
        cancelReceivedReq: () => { }
    },
    sentReqsMethods: {
        addSentReq: () => { },
        cancelSentReq: () => { }
    }
})

export const FriendshipRequestsProvider = ({ children }: { children: ReactNode }) => {

    const { firstAuth, secondAuth } = useAppAuth()
    const queryClient = useQueryClient()

    const sentReqsDownloadUrl = `${SERVER_BASE_URL}/friends/getAllSendedRequests`
    const recdReqsDownloadUrl = `${SERVER_BASE_URL}/friends/getAllReceivedRequests`

    const qKeySuffix = (user: User) => `${user.email};${user.uid};${user.providerId}`

    const sentFReqsQKey = [
        (firstAuth.status !== 'authenticated') ?
            `anonymous` :
            `sentfreqslistquerykey:${qKeySuffix(firstAuth.user)}`
    ]
    const recdFReqsQKey = [
        (firstAuth.status !== 'authenticated') ?
            `anonymous` :
            `recdfreqslistquerykey:${qKeySuffix(firstAuth.user)}`
    ]

    const apiHook_sentReqs = useCursorPaginatedAPI({
        url: sentReqsDownloadUrl,
        queryKey: sentFReqsQKey,
        initialCursor: '0',
        enabled: (firstAuth.status === 'authenticated') && (secondAuth.status === 'authenticated'),
    }, {
        beforeQuery: {
            setConfig: setAuthorizationHeader
        }
    })
    const apiHook_recdReqs = useCursorPaginatedAPI({
        url: recdReqsDownloadUrl,
        queryKey: recdFReqsQKey,
        initialCursor: '0',
        enabled: (firstAuth.status === 'authenticated') && (secondAuth.status === 'authenticated'),
    }, {
        beforeQuery: {
            setConfig: setAuthorizationHeader
        }
    })

    const receivedReqsMethods: receivedReqsMethodsCallbackDescriptors = {
        /*quando ricevo una richiesta e il server manda la notifica sul canale ably mio privato, 
        io procedo ad aggiungerla nella lista delle richieste ricevute.*/
        addReceivedReq: (req) => {
            queryClient.setQueryData(recdFReqsQKey, (oldData: any) => {
                if (!oldData) return oldData

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any, i: number) =>
                        i === 0
                            ? {
                                ...page,
                                result: [req, ...page.result],
                                totalRecords: -1
                            }
                            : page
                    )
                }
            })
        },
        cancelReceivedReq: (reqId) => {
            queryClient.setQueryData(recdFReqsQKey, (oldData: any) => {
                if (!oldData) return oldData

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => {
                        const newResult = page.result.filter((req: receivedFriendshipRequestFromBackend) => req.requestId !== reqId)
                        return {
                            ...page,
                            result: newResult,
                            totalRecords: newResult.length
                        }
                    })
                }
            })
        }
    }

    const sentReqsMethods: sentReqsMethodsCallbackDescriptors = {
        /*quando mando una richiesta e il server risponde con "invio confermato" 
        io procedo ad aggiungerla nella lista delle richieste inviate.*/
        addSentReq: (req) => {
            queryClient.setQueryData(sentFReqsQKey, (oldData: any) => {
                if (!oldData) return oldData

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any, i: number) =>
                        i === 0
                            ? {
                                ...page,
                                result: [req, ...page.result],
                                totalRecords: -1
                            }
                            : page
                    )
                }
            })
        },
        /*quando premo "cancella" su una richiesta di amicizia inviata, e il server risponde con
        una conferma di averlo fatto, io elimino il record dalla mia lista locale di richieste di amicizia inviate.*/
        cancelSentReq: (requestId) => {
            queryClient.setQueryData(sentFReqsQKey, (oldData: any) => {
                if (!oldData) {
                    return oldData
                }
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        result: page.result.filter(
                            (req: sentFriendshipRequestFromBackend) =>
                                req.requestId !== requestId
                        ),
                        totalRecords: -1
                    }))
                }
            })
        }
    }

    return (
        <FriendshipRequestsContext.Provider value={{
            apiHooks: {
                sentReqs: apiHook_sentReqs,
                recdReqs: apiHook_recdReqs
            },
            receivedReqsMethods,
            sentReqsMethods
        }}>
            {children}
        </FriendshipRequestsContext.Provider>
    )
}

export const useFriendshipRequestsContext = () => useContext(FriendshipRequestsContext)
