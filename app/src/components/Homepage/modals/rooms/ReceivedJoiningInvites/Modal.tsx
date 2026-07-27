
import { Box, Button, CloseButton, Dialog, Flex, Portal, Spinner, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"
import { useDeviceDetection } from "../../../../../contexts/DeviceDetectorContext"

import ReceivedInviteCard from './subcomponents/Card/Card'
import { useReceivedRoomJoiningInvitesInfinity } from "../../../../../hooks/useReceivedRoomJoiningInvitesInfinity"
import { Virtuoso } from "react-virtuoso"
import type { receivedJoiningInvite } from "../../../../../utils/types/rooms"

type props = {
    trigger: ReactNode
}

function Modal({ trigger }: props) {

    const { isResolved, isMobile } = useDeviceDetection()
    const { query } = useReceivedRoomJoiningInvitesInfinity()

    if (!isResolved) {
        return null
    }

    const pages = query.data?.pages || []
    const totalInvites = pages[pages.length - 1]?.totalRecords

    const flatted: Array<receivedJoiningInvite> = query.data?.pages.flatMap(page => page.result) || []

    return (
        <Dialog.Root closeOnInteractOutside={false}>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius={18} bgColor={'#fdeaff'} marginInline={isMobile ? 2 : 0}>
                        <Dialog.Header>
                            <Dialog.Title color={'#ab1f84'}>Inviti ricevuti</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body display={'flex'} flexDirection={'column'} alignItems={'center'}>
                            <Box w="full" h="full" minH={(query.isFetching || !totalInvites) ? 'auto' : 420} p={2} display={'flex'}>

                                {
                                    query.error ? (
                                        <Flex direction={'column'} alignItems={'center'} justifyContent={'center'} gap={2} flex={1}>
                                            <Text color={'red'}>Errore durante il download</Text>
                                            <Button colorPalette={'pink'} rounded={'xl'} onClick={()=>query.refetch()}>Riprova</Button>
                                        </Flex> 
                                    ) : query.isFetching ? (
                                        <Flex alignItems={'center'} justifyContent={'center'} flex={1}>
                                            <Spinner size={'lg'} color={'purple'} />
                                        </Flex>
                                    ) : (totalInvites === 0) ? (
                                        <Text fontSize={'lg'} color={'gray'} textAlign={'center'} w={'full'}>Nessun invito ricevuto</Text>
                                    ) : (
                                        <Box overflow="auto" pr={2} style={{
                                            '&::WebkitScrollbar': { width: '8px', height: '8px', padding: 12 },
                                            '&::WebkitScrollbarTrack': { background: '#f0e6f2', borderRadius: '8px' },
                                            '&::WebkitScrollbarThumb': { backgroundColor: '#a1145b', borderRadius: '8px', border: '2px solid #f0e6f2' },
                                            '&::WebkitScrollbarThumb:hover': { backgroundColor: '#c2186d' },
                                            scrollbarWidth: 'thin', // Firefox
                                            scrollbarColor: '#a1145b #f0e6f2', // Firefox
                                        } as any} display={'flex'} flex={1}
                                        >
                                            <Virtuoso data={flatted}
                                                itemContent={(index, element) => {
                                                    return <Box mt={2} mr={1}>
                                                        <ReceivedInviteCard key={element.inviteId} invite={element} />
                                                    </Box>
                                                }}
                                                endReached={() => query.fetchNextPage()}
                                                overscan={200}
                                                style={{ flex: 1 }}
                                            />
                                        </Box>
                                    )
                                }
                            </Box>

                        </Dialog.Body>
                        <Dialog.Footer>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size={'xs'} borderRadius={10} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )

}

export default Modal
