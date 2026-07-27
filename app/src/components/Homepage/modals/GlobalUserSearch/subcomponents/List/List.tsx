import FetchingSkeleton from '../../../subcomponents/FetchingSkeleton/MySkeleton'
import FetchingErrorMessage from '../../../subcomponents/FetchingErrorMessage/Message'
import { Box, Text } from '@chakra-ui/react'
import type { globalUserSearchRecord } from '../../../../../../utils/types/global'
import { useDeviceDetection } from '../../../../../../contexts/DeviceDetectorContext'
import { Virtuoso } from 'react-virtuoso'
import { useRef } from 'react'
import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from '@tanstack/react-query'
import RecordCard from '../Record/Card'

interface ListProps {
    hasNoStartedWriting: boolean
    isLoading: boolean
    error: Error | null
    items: globalUserSearchRecord[],
    hasMore: boolean,
    fetchNext: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>,
    isFetchingNext: boolean,
    refetch: ()=>void
}

export default function List({ hasNoStartedWriting, isLoading, error, items, fetchNext, hasMore , refetch}: ListProps) {
    const { isResolved } = useDeviceDetection()
    const fetchingRef = useRef(false)

    if (!isResolved) return null

    if (hasNoStartedWriting) {
        return <Text color={'gray'}>Inizia a digitare lo username dell'utente al quale desideri mandare la richiesta di amicizia.</Text>
    }

    if (isLoading) {
        return <FetchingSkeleton />
    }

    if (error) {
        return <FetchingErrorMessage error={error} refetch={refetch}  />
    }

    return (
        <>
            <Virtuoso
                style={{ height: 320, width: '100%', display: 'flex', flexDirection: 'column' }}
                totalCount={items.length}
                itemContent={index => {
                    const item = items[index]
                    return <>
                        <div style={{ marginTop: '8px' }}>
                            <RecordCard key={item.userId} user={{ ...item }} />
                        </div>
                        {
                            (index === (items.length - 1)) && (
                                <Box w="full" borderRadius={18} mt="8px" p={2} background="linear-gradient(90deg, #bfdbfe 0%, #99f6e4 100%)">
                                    <Text textAlign={'center'} color={'#525252'}>
                                        {(hasMore) ? <>Sto caricando altro...</> : <>I risultati sono terminati.</>}
                                    </Text>
                                </Box>
                            )
                        }
                    </>
                }}
                endReached={() => {
                    if (hasMore && !isLoading && !fetchingRef.current) {
                        fetchingRef.current = true
                        fetchNext().finally(() => fetchingRef.current = false)
                    }
                }}
            />
        </>
    )
}
