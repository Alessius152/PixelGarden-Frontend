import { useInfiniteQuery } from "@tanstack/react-query"
import { useAppAuth } from "../contexts/AppAuthContext"
import axios from "axios"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import type { privateRoomData } from "../utils/types/rooms"

type apiCursor = {
    cursor1: string,
    cursor2: string,
}

type apiResponse = {
    result: Array<privateRoomData>,
    nextCursor: apiCursor,
    isTheLastPage: boolean,
}

export function useFriendRoomsInfinite(relationId: string | undefined) {

    const { secondAuth } = useAppAuth()

    const serverUser = secondAuth.status === 'authenticated' ? secondAuth.user : undefined
    const url = `${SERVER_BASE_URL}/rooms/getRoomsWhereImIn`
    const qKey = ['roomsQuery', 'friend', serverUser?.uuid ?? '', relationId]
    const query = useInfiniteQuery<apiResponse, Error>({
        enabled: (!!serverUser) && (!!relationId) && (relationId !== '0'),
        queryKey: qKey,
        queryFn: async ({ pageParam }) => {
            const { cursor1, cursor2 } = pageParam as { cursor1: string, cursor2: string }
            const callHeaders = {}

            await signHttpHeaderWithFirebaseJwtToken(callHeaders)

            const res = await axios.get<apiResponse>(url, {
                params: { relationId, cursor1, cursor2 },
                headers: callHeaders
            })

            return res.data
        },
        initialPageParam: { relationId, cursor1: '0', cursor2: '' },
        getNextPageParam: (lastPage) => lastPage.isTheLastPage ? undefined : lastPage.nextCursor,
        staleTime: 2 * 1000 * 60,
    })

    return { query }
}
