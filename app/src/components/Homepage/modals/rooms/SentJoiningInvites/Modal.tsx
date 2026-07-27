
import { Box, CloseButton, Dialog, Flex, Portal, Spinner, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"
import { useDeviceDetection } from "../../../../../contexts/DeviceDetectorContext"

import SentInviteCard from './subcomponents/Card/Card'
import { useSentRoomJoiningInvitesInfinity } from "../../../../../hooks/useSentRoomJoiningInvites"
import { Virtuoso } from "react-virtuoso"

type props = {
    trigger: ReactNode
}

function Modal({ trigger }: props) {

    const { isResolved, isMobile } = useDeviceDetection()
    const { query } = useSentRoomJoiningInvitesInfinity()

    if (!isResolved) {
        return null
    }

    const pages = query.data?.pages || []
    const totalPendingReqs = pages[pages.length - 1]?.totalRecords

    // const titleLabel = (true) ? (
    //     <><Spinner size={'xs'} /> Sto caricando</>
    // ) : (
    //     <>Sei in attesa di {totalPendingReqs} risposte</>
    // )

    const flatted = pages.flatMap(page => page.result)

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
                            <Dialog.Title color={'#ab1f84'}>Inviti spediti</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body display={'flex'} flexDirection={'column'} alignItems={'center'}>
                            {query.isFetching ? (
                                <Flex alignItems={'center'} justifyContent={'center'} flex={1}>
                                    <Spinner size={'lg'} color={'purple'} />
                                </Flex>
                            ) : (totalPendingReqs == 0) ? (
                                <Text fontSize={'lg'} color={'gray'} textAlign={'center'} w={'full'}>Non hai ancora spedito nessun invito</Text>
                            ) : (
                                <Box w="full" h="full" minH={420} p={2} display={'flex'}>
                                    <Box overflow="auto" pr={2} style={{
                                        '&::WebkitScrollbar': { width: '8px', height: '8px', padding: 12 },
                                        '&::WebkitScrollbarTrack': { background: '#f0e6f2', borderRadius: '8px' },
                                        '&::WebkitScrollbarThumb': { backgroundColor: '#a1145b', borderRadius: '8px', border: '2px solid #f0e6f2' },
                                        '&::WebkitScrollbarThumb:hover': { backgroundColor: '#c2186d' },
                                        scrollbarWidth: 'thin', scrollbarColor: '#a1145b #f0e6f2',
                                    } as any} display={'flex'} flex={1}
                                    >
                                        <Virtuoso data={flatted}
                                            itemContent={(_index, element) => {
                                                return <Box mt={2} mr={1}>
                                                    <SentInviteCard key={element.inviteId} invite={element} />
                                                </Box>
                                            }}
                                            endReached={() => query.fetchNextPage()}
                                            overscan={200}
                                            style={{ flex: 1 }}
                                        />
                                    </Box>
                                </Box>
                            )}
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
