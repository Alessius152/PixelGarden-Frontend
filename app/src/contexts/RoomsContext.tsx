import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import type { friendDataFromBackend } from "../utils/types/friends"
import { useMyRoomsInfinite } from "../hooks/useMyRoomsInfinite"
import { useFriendRoomsInfinite } from "../hooks/useFriendRoomsInfinite"
import { useQueryClient, type InfiniteData, type UseInfiniteQueryResult } from "@tanstack/react-query"
import type { apiResponse_roomsList, privateRoomData } from "../utils/types/rooms"
import { useAppAuth } from "./AppAuthContext"

interface RoomContextProps {
    selectedUser: friendDataFromBackend | undefined,
    setSelectedUser: React.Dispatch<React.SetStateAction<friendDataFromBackend | undefined>>,
    queries: {
        myRooms: UseInfiniteQueryResult<InfiniteData<apiResponse_roomsList, unknown>, Error>,
        friendRooms: UseInfiniteQueryResult<InfiniteData<apiResponse_roomsList, unknown>, Error>
    },
    manuallyEdits: {
        owner: {
            addManuallyOwnselfRoom: (roomData: privateRoomData) => void,
            removeExFriendRoomsList: (relationId: string) => void
        }
    }
}

const RoomsContext = createContext<RoomContextProps | undefined>(undefined)

export const RoomsProvider = ({ children }: { children: ReactNode }) => {

    const [selectedUser, setSelectedUser] = useState<friendDataFromBackend>()
    const { query: myRoomsQuery, qKey: myRoomsQKey } = useMyRoomsInfinite()
    const { query: friendRoomsQuery } = useFriendRoomsInfinite(selectedUser?.relationId)
    const { secondAuth } = useAppAuth()
    const queryClient = useQueryClient()

    const addManuallyOwnselfRoom = useCallback((roomData: privateRoomData) => {
        queryClient.setQueryData<InfiniteData<apiResponse_roomsList>>(
            myRoomsQKey,
            (oldData) => {
                if (!oldData) return oldData

                return {
                    ...oldData,
                    pages: oldData.pages.map((page, index) => {
                        if (index === 0) {
                            return { ...page, result: [roomData, ...page.result] }
                        }
                        return page
                    })
                }
            }
        )
    }, [queryClient, myRoomsQKey])

    const removeExFriendRoomsList = useCallback((relationId: string) => {
        if (secondAuth.status !== 'authenticated') return

        const qKey = ['roomsQuery', 'friend', secondAuth.user.uuid, relationId]

        queryClient.removeQueries({ queryKey: qKey })
        queryClient.invalidateQueries({ queryKey: qKey })
    }, [queryClient, secondAuth])

    const ctxVal = useMemo(() => {
        return {
            selectedUser,
            setSelectedUser,
            queries: {
                myRooms: myRoomsQuery,
                friendRooms: friendRoomsQuery
            },
            manuallyEdits: {
                owner: {
                    addManuallyOwnselfRoom,
                    removeExFriendRoomsList
                },
            }
        }
    }, [selectedUser, myRoomsQuery, friendRoomsQuery, addManuallyOwnselfRoom, removeExFriendRoomsList])

    return (
        <RoomsContext.Provider value={ctxVal}>
            {children}
        </RoomsContext.Provider>
    )
}

export const useRoomsContext = () => {
    const context = useContext(RoomsContext)
    if (!context) {
        throw new Error('useRoomsContext must be used inside RoomsProvider')
    }
    return context
}
