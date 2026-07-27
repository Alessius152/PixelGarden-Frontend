import { Box, Button, Spinner, Text } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../../contexts/DeviceDetectorContext'

import { useRoomsContext } from '../../../../../contexts/RoomsContext'

import DesktopTabletCard from '../RoomCard/desktop_tablet/Card'
import MobileCard from '../RoomCard/mobile/Card'
import { useEffect, useState, useCallback } from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { privateRoomData } from '../../../../../utils/types/rooms'
import { useNavigate } from 'react-router-dom'
import { appRoutes } from '../../../../../utils/objects/objects'

type props = {
    focused: string
}

function List({ focused }: props) {

    const { isMobile } = useDeviceDetection()
    const { selectedUser, queries } = useRoomsContext()

    const [blocked, setBlocked] = useState(false)

    const navigate = useNavigate()

    const isMe = selectedUser?.relationId === '0'

    const rooms = isMe
        ? (queries.myRooms.data?.pages.flatMap(p => p.result) ?? [])
        : (queries.friendRooms.data?.pages.flatMap(p => p.result) ?? [])

    const sortedRooms = [...rooms].sort((a, b) => a.name.localeCompare(b.name))
    const query = isMe ? queries.myRooms : queries.friendRooms

    const noRooms =
        sortedRooms.length === 0 &&
        !query.isLoading &&
        !query.isFetchingNextPage &&
        !query.error

    const noRoomsText = (
        <Box fontSize={isMobile ? 'xs' : 'md'} textAlign={'center'} color={'gray'}>
            {
                isMe ? (
                    <Text>
                        Non hai creato alcuna stanza. Puoi iniziare creando il bottone qui sopra.
                    </Text>
                ) : (
                    <Text>
                        Non sei in nessuna stanza di proprietà di <b>{selectedUser?.friend}</b>.
                        {isMobile ? <br /> : <>&nbsp;</>}Qualsiasi suo invito si troverà negli inviti ricevuti.
                    </Text>
                )
            }
        </Box>
    )

    const isLoading = query.isLoading || query.isFetchingNextPage

    const loadingBox = (
        <Box p={2} w={'full'} display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'} gap={4}>
            <Spinner size="xl" color={'gray'} />
            <Text fontSize={isMobile ? 'xs' : 'sm'}>Sto scaricando le pagine, è richiesto un attimo di attesa</Text>
            <LoadingLabel />
        </Box>
    )

    const loadMore = useCallback(() => {
        if (!query.isFetchingNextPage && query.hasNextPage) {
            query.fetchNextPage()
        }
    }, [query])

    const onWouldEnterInARoom = (room: privateRoomData) => {
        const { roomId } = room
        navigate(`${appRoutes.WORKING_ROOM}/${roomId}`)
    }

    const renderRoom = useCallback((index: number) => {
        const room = sortedRooms[index]
        return <Box marginBottom={2} paddingInline={2}>
            {isMobile ? (
                <MobileCard key={room.roomId} value={room.roomId} isYours={isMe} focused={focused} room={room}
                    eventHandlers={{
                        onWouldEnter: () => { onWouldEnterInARoom(room) }
                    }}
                />
            ) : (
                <DesktopTabletCard key={room.roomId} room={room} isYours={isMe}
                    eventHandlers={{
                        onWouldEnter: () => { onWouldEnterInARoom(room) }
                    }}
                />
            )}
        </Box>
    }, [sortedRooms, isMobile, isMe, focused])

    useEffect(() => {
        if (query.error) {
            setBlocked(true)
        } else if (!query.isFetchingNextPage) {
            setBlocked(false)
        }
    }, [query.error, query.isFetchingNextPage])

    if (isLoading && sortedRooms.length === 0) return loadingBox
    if (noRooms) return noRoomsText

    // const hasError = query.error && !query.isFetchingNextPage;

    return (
        <Box w="full" h={'full'} display="flex" flexDirection="column" justifyContent={'center'}>
            <Virtuoso
                data={sortedRooms}
                itemContent={(index) => renderRoom(index)}
                endReached={() => {
                    if (blocked || query.failureCount >= 2) return;
                    loadMore();
                }}
                overscan={200}
                style={{ width: '100%', height: '100%' }}
            />
            {(blocked && (!query.isFetching)) && (
                <>
                    <Text fontSize={'sm'} color={'red.600'} alignSelf={'center'} mt={2}>errore durante il download</Text>
                    <Button
                        onClick={() => {
                            setBlocked(false); // sblocca subito per mostrare spinner
                            query.refetch();   // refetch async, spinner apparirà grazie a isFetchingNextPage
                        }}
                        alignSelf={'center'}
                        borderRadius={14}
                        colorPalette={'pink'}
                        mt={1}
                    >
                        Riprova
                    </Button>
                </>
            )}
            {query.isFetchingNextPage && (
                <Box display="flex" justifyContent="center" p={2}>
                    <Spinner size="md" />
                </Box>
            )}
        </Box>
    )
}

function LoadingLabel() {
    const [dC, setDC] = useState(1)
    const { isMobile } = useDeviceDetection()
    useEffect(() => {
        const interval = setInterval(() => {
            setDC(prev => ((prev + 1) === 4 ? 1 : prev + 1))
        }, 750)
        return () => clearInterval(interval)
    }, [])
    return <Text fontSize={isMobile ? 'xs' : 'sm'}>Download{'.'.repeat(dC)}</Text>
}

export default List
