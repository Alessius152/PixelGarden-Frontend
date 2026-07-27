
import { useRef, type ReactNode } from 'react'
import { Dialog, Portal, Text } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../contexts/DeviceDetectorContext'
import { useFriendshipRequestsContext } from '../../../../contexts/FriendshipRequestsContext'
import { Virtuoso } from 'react-virtuoso'

import RequestCard from './subcomponents/Card/Card'

function Modal(
    { trigger }: {
        trigger: ReactNode
    }
) {

    const { isResolved, isDesktop } = useDeviceDetection()
    const { apiHooks } = useFriendshipRequestsContext()

    const { fetchNext, hasMore, isLoading, items } = apiHooks.recdReqs

    if (!isResolved) {
        return null
    }

    const hasNoReceivedReqs = (!isLoading) && (!items.length)
    const fetchingRef = useRef(false)

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content marginInline={(!isDesktop) ? 3 : 0} borderRadius={18} display={'flex'} flexDirection={'column'}>
                        <Dialog.Header flexDirection={'column'} alignItems={'center'} gap={4} >
                            <Text
                                w={'full'} textAlign={'center'} fontSize={'2xl'} color={'purple'} fontWeight={'medium'}
                            >
                                Richieste di amicizia ricevute
                            </Text>
                            <Text fontSize={'sm'} color={'gray'} textAlign={'center'} paddingInline={12} lineHeight={1.15}>
                                Le richieste di amicizia in stato di pendenza saranno eliminate dopo 24 ore.
                            </Text>
                        </Dialog.Header>
                        <Dialog.Body
                            minH={320} maxH={320} border={'1px solid lightgray'} borderRadius={18} m={2} p={4} overflow={'auto'}
                            flex={1} display={'flex'} flexDirection={'column'}
                        >
                            {
                                (hasNoReceivedReqs) ? (
                                    <Text color={'gray'}>Non hai ricevuto nessuna richiesta di amicizia.</Text>
                                ) : (
                                    <Virtuoso
                                        style={{
                                            flex: 1, height: '100%', width: '100%',
                                            display: 'flex', flexDirection: 'column'
                                        }}
                                        totalCount={items.length}
                                        itemContent={(index) => {
                                            const item = items[index]
                                            return <div style={{ marginTop: '8px' }}>
                                                <RequestCard data={item} key={`sent-f-reqs-list-item_${index}`} />
                                            </div>
                                        }}
                                        endReached={() => {
                                            if (hasMore && (!isLoading) && !fetchingRef.current) {
                                                fetchingRef.current = true
                                                fetchNext().finally(() => fetchingRef.current = false)
                                            }
                                        }}
                                    />
                                )
                            }
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )

}

export default Modal
