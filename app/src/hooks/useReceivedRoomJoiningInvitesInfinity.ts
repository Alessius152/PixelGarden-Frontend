import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { useAppAuth } from "../contexts/AppAuthContext"
import axios from "axios"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import type { apiResponse_receivedJoiningInvites, receivedJoiningInvite } from "../utils/types/rooms"

export function useReceivedRoomJoiningInvitesInfinity() {

    const { secondAuth } = useAppAuth()

    const serverUser = secondAuth.status === 'authenticated' ? secondAuth.user : undefined
    const url = `${SERVER_BASE_URL}/rooms/getReceivedInvites`

    const qKey = ['receivedJoiningInvites', serverUser?.uuid ?? '']
    const query = useInfiniteQuery<apiResponse_receivedJoiningInvites, Error>({
        enabled: (!!serverUser) && (location.pathname === '/homepage/rooms'),
        queryKey: qKey,
        queryFn: async ({ pageParam }) => {
            const { cursor } = pageParam as { cursor: string }
            const callHeaders = {}

            await signHttpHeaderWithFirebaseJwtToken(callHeaders)

            const res = await axios.get<apiResponse_receivedJoiningInvites>(url, {
                params: { cursor },
                headers: callHeaders
            })
            return res.data
        },
        initialPageParam: { cursor: '0' },
        getNextPageParam: (lastPage) => lastPage.isTheLastPage ? undefined : ({ cursor: lastPage.nextCursor }),
        staleTime: 1000 * 60,
    })

    const queryClient = useQueryClient()

    const methods = {
        addReceivedRoomJoinInviteManually: (req: receivedJoiningInvite) => {
            queryClient.setQueryData<InfiniteData<apiResponse_receivedJoiningInvites>>(qKey, (oldData) => {
                if (!oldData) return oldData
                const newPages = [...oldData.pages]
                const firstPage = { ...newPages[0] }
                firstPage.result = [req, ...firstPage.result]
                firstPage.totalRecords = (firstPage.totalRecords || 0) + 1
                newPages[0] = firstPage
                return {...oldData,pages: newPages}
            })
        }
    }

    return { query, qKey, methods }
}
