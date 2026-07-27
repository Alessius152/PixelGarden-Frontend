import './MySelect.css'

import { Avatar, Box, Button, Flex, Select, Spinner, Text, type ListCollection } from "@chakra-ui/react"
import type { friendDataFromBackend } from "../../../../../utils/types/friends"
import { useDeviceDetection } from "../../../../../contexts/DeviceDetectorContext"
import { Virtuoso } from 'react-virtuoso'
import { useFriendsContext } from '../../../../../contexts/FriendsContext'
import { useEffect, useState } from 'react'
import { buildVoidProfilePicture } from '../../../../../utils/objects/ui'
import { useRoomsContext } from '../../../../../contexts/RoomsContext'

type props = {
    members: ListCollection<friendDataFromBackend>
}

function MySelect({ members }: props) {

    const { isResolved, isMobile } = useDeviceDetection()
    const { fetchNext, isLoading, isFetchingNext, error, isFetching,refetch } = useFriendsContext()
    const { setSelectedUser } = useRoomsContext()

    if (!isResolved) {
        return null
    }

    const handleFilter = async (friend: friendDataFromBackend) => {
        setSelectedUser(friend) //qui friend.friendId potrebbe anche essere 0, cioè me stesso per vedere le mie stanze.
    }

    const [defaultValue] = useState(members.items[0].relationId)

    useEffect(() => {
        if (defaultValue) {
            handleFilter(members.items[0])
        }
    }, [defaultValue])

    return (
        <Select.Root
            collection={members} defaultValue={['0']}
            className="rooms-creator-filter-select"
            positioning={{ sameWidth: true }} width={isMobile ? undefined : "340px"}
            size="sm" h="full" alignSelf="center" justifyContent="center"
            onValueChange={(data) => {
                const selected = data.items[0]
                handleFilter(selected)
            }}
            onOpenChange={(details) => {
                if (details.open) {
                    if (!members.items.length) {
                        fetchNext()
                    }
                }
            }}
        >
            <Select.HiddenSelect />

            <Select.Control>
                <Select.Trigger borderRadius={12} bgColor="whitesmoke" fontSize="sm">
                    <Select.ValueText placeholder="Filtra per creatore" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                </Select.IndicatorGroup>
            </Select.Control>

            <Select.Positioner>
                <Select.Content maxH="260px" overflow="hidden">
                    <Virtuoso
                        style={{ height: 260 }}
                        data={members.items}
                        itemContent={(index, item) => (
                            <Select.Item item={item} key={item.relationId}
                                justifyContent="flex-start" fontSize="sm"
                                _hover={{ bgColor: '#70344f95', borderRadius: 8, color: 'white' }}
                            >
                                <Avatar.Root shape="full" size="2xs">
                                    <Avatar.Fallback name={item.friend}>
                                        {buildVoidProfilePicture(item.friend, 24)}
                                    </Avatar.Fallback>
                                </Avatar.Root>

                                {item.friend}
                                <Select.ItemIndicator />
                            </Select.Item>
                        )}
                        endReached={() => {
                            if ((!isFetchingNext) && (!isLoading)) {
                                fetchNext()
                            }
                        }}
                    />
                    {(error && (!isFetching)) ? (
                        <Flex alignItems={'center'} justifyContent={'center'} w={'full'} gap={2} p={0}>
                            <Text color={'red.700'} fontSize={'xs'}>Errore durante il download</Text>
                            <Button colorPalette={'red'} size={'2xs'} fontSize={'xx-small'} borderRadius={8} onClick={()=>{
                                refetch()
                            }}>Riprova</Button>
                        </Flex>
                    ) : <></>}
                    {isFetching ? (
                        <Box display={'flex'} alignItems={'center'} justifyContent={'center'} gap={2}><Spinner size={'xs'} /> Download in corso</Box>
                    ) : <></>}
                </Select.Content>
            </Select.Positioner>
        </Select.Root>
    )
}

export default MySelect
