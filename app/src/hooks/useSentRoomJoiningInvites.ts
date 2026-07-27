import { useInfiniteQuery } from "@tanstack/react-query"
import { useAppAuth } from "../contexts/AppAuthContext"
import axios from "axios"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import type { apiResponse_sentJoiningInvites } from "../utils/types/rooms"

export function useSentRoomJoiningInvitesInfinity() {

    const { secondAuth } = useAppAuth()

    const serverUser = secondAuth.status === 'authenticated' ? secondAuth.user : undefined
    const url = `${SERVER_BASE_URL}/rooms/getSentInvites`

    const qKey = ['sentJoiningInvites', serverUser?.uuid ?? '']
    const query = useInfiniteQuery<apiResponse_sentJoiningInvites, Error>({
        enabled: (!!serverUser) && (location.pathname === '/homepage/rooms'),
        queryKey: qKey,
        queryFn: async ({ pageParam }) => {
            const { cursor } = pageParam as { cursor: string }
            const callHeaders = {}

            await signHttpHeaderWithFirebaseJwtToken(callHeaders)

            const res = await axios.get<apiResponse_sentJoiningInvites>(url, {
                params: { cursor },
                headers: callHeaders
            })
            return res.data
        },
        initialPageParam: { cursor: '0' },
        getNextPageParam: (lastPage) => lastPage.isTheLastPage ? undefined : ({ cursor: lastPage.nextCursor }),
        staleTime: 1000 * 60,
    })

    return { query, qKey }
}
