
import { useRef, type ReactNode } from 'react'
import { Dialog,  Portal, Text } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../contexts/DeviceDetectorContext'

import RequestCard from './subcomponents/Card/Card'
import { useFriendshipRequestsContext } from '../../../../contexts/FriendshipRequestsContext'
import { Virtuoso } from 'react-virtuoso'

function Modal(
    { trigger }: {
        trigger: ReactNode
    }
) {

    const { isResolved, isDesktop, isMobile } = useDeviceDetection()
    const { apiHooks } = useFriendshipRequestsContext()

    if (!isResolved) {
        return null
    }

    const hasNoSentReqs = (!apiHooks.sentReqs.isLoading)
        && (!apiHooks.sentReqs.items.length)

    const fetchingRef = useRef(false)

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content marginInline={(!isDesktop) ? 3 : 0} borderRadius={18}>
                        <Dialog.Header flexDirection={'column'} alignItems={'center'} gap={4} >
                            <Text
                                w={'full'} textAlign={'center'} fontSize={'2xl'} color={'#54a783'} fontWeight={'medium'}
                            >
                                Richieste di amicizia inviate
                            </Text>
                            <Text fontSize={'sm'} color={'gray'} textAlign={'center'} paddingInline={12} lineHeight={1.15}>
                                Le richieste di amicizia in stato di pendenza saranno eliminate dopo 24 ore.
                            </Text>
                        </Dialog.Header>
                        <Dialog.Body
                            minH={320} maxH={320} border={'1px solid lightgray'} m={2} borderRadius={18} p={isMobile ? 2 : 4}
                            overflow={'auto'} display={hasNoSentReqs ? 'block' : 'flex'}
                        >
                            {
                                (hasNoSentReqs) ? (
                                    <Text color={'gray'} w={'full'}>Non hai inviato nessuna richiesta di amicizia.</Text>
                                ) : (
                                    <Virtuoso
                                        style={{ height: 'inherit', width: '100%', display: 'flex', flexDirection: 'column' }}
                                        totalCount={apiHooks.sentReqs.items.length}
                                        itemContent={(index) => {
                                            const item = apiHooks.sentReqs.items[index]
                                            return <div style={{ marginTop: '8px' }}>
                                                <RequestCard data={item} key={`sent-f-reqs-list-item_${index}`} />
                                            </div>
                                        }}
                                        endReached={() => {
                                            if (apiHooks.sentReqs.hasMore && (!apiHooks.sentReqs.isLoading) && !fetchingRef.current) {
                                                fetchingRef.current = true
                                                apiHooks.sentReqs.fetchNext().finally(() => fetchingRef.current = false)
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
