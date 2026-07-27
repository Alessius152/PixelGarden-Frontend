import { useInfiniteQuery } from "@tanstack/react-query"
import { useAppAuth } from "../contexts/AppAuthContext"
import axios from "axios"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import type { apiResponse_roomsList } from "../utils/types/rooms"

export function useMyRoomsInfinite() {

    const { secondAuth } = useAppAuth()

    const serverUser = secondAuth.status === 'authenticated' ? secondAuth.user : undefined
    const url = `${SERVER_BASE_URL}/rooms/getMyRooms`

    const qKey = ['roomsQuery', 'me', serverUser?.uuid ?? '']
    const query = useInfiniteQuery<apiResponse_roomsList, Error>({
        enabled: (!!serverUser) && (location.pathname === '/homepage/rooms'),
        queryKey: qKey,
        queryFn: async ({ pageParam }) => {
            const { cursor1, cursor2 } = pageParam as { cursor1: string, cursor2: string }
            const callHeaders = {}

            await signHttpHeaderWithFirebaseJwtToken(callHeaders)

            const res = await axios.get<apiResponse_roomsList>(url, {
                params: { cursor1, cursor2 },
                headers: callHeaders
            })

            return res.data
        },
        select: (data) => {
            const roomIdMap = new Map<string, true>()
            const newPages = data.pages.map(page => {
                const dedupedRooms = []
                for (const room of page.result) {
                    const { roomId } = room
                    if (!roomIdMap.has(roomId)) {
                        roomIdMap.set(roomId, true)
                        dedupedRooms.push(room)
                    }
                }
                return { ...page, result: dedupedRooms }
            })
            return { ...data, pages: newPages }
        },
        initialPageParam: { cursor1: '0', cursor2: '' },
        getNextPageParam: (lastPage) => lastPage.isTheLastPage ? undefined : lastPage.nextCursor,
        staleTime: 2 * 1000 * 60,
    })

    return { query, qKey }
}
