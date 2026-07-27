
import {
    Accordion,
    Box,
    createListCollection,
    Flex,
} from '@chakra-ui/react'

import { useDeviceDetection } from '../../../../contexts/DeviceDetectorContext'
import { useFriendsContext } from '../../../../contexts/FriendsContext'
import { useAppAuth } from '../../../../contexts/AppAuthContext'
import type { friendDataFromBackend } from '../../../../utils/types/friends'

import RoomActionsButtonsWrapper from '../../../../components/Homepage/subroutes/rooms/RoomsActionsButtonsWrapper/Wrapper'
import MobileOtherActionsMenu from '../../../../components/Homepage/subroutes/rooms/MobileOtherActionsMenu/Menu'
import RoomsListFilterByCreator from '../../../../components/Homepage/subroutes/rooms/RoomsListFilterByCreator/MySelect'
import RoomsList from '../../../../components/Homepage/subroutes/rooms/RoomsList/List'
import { useState, type ReactNode } from 'react'

function Section() {

    const { isMobile, isResolved } = useDeviceDetection()
    const { friends } = useFriendsContext()
    const { secondAuth } = useAppAuth()

    //mobile accordion
    const [focused, setFocused] = useState('')

    if (!isResolved) {
        return null
    }

    if (!(secondAuth.status === 'authenticated')) {
        return
    }

    const owner: friendDataFromBackend = {
        friend: `${secondAuth.user.username} (Tu)`,
        friendId: '0',
        relationId: '0',
        isOnline: false
    }
    const members = createListCollection({
        items: [owner, ...friends],
        itemToString: (item) => item.friend,
        itemToValue: (item) => item.relationId,
    })

    const roomFilteringByFriend = {
        selectBox: () => {
            return <RoomsListFilterByCreator members={members} />
        }
    }

    const leftPlacedContainer = <>
        {roomFilteringByFriend.selectBox()}
    </>

    const rightPlacedButtons = isMobile ? (
        <Box w={'max-content'}>
            <MobileOtherActionsMenu />
        </Box>
    ) : (
        <Flex gap={1} alignItems={'center'} height={'full'}>
            <RoomActionsButtonsWrapper />
        </Flex>
    )

    const mobileWrapper = (children: ReactNode) => (
        <Accordion.Root
            collapsible defaultValue={["b"]}
            onValueChange={(details) => { setFocused(details.value[0]) }}
            h={'full'}
        >
            {children}
        </Accordion.Root>
    )

    const roomsList = <RoomsList
        focused={focused}
    />

    return (
        <>
            <Box className="rooms-section" display={'flex'} flexDirection={'column'} h={'full'}>
                <Box
                    display={'flex'} justifyContent={'space-between'} overflow={'hidden'}
                    padding={2} gap={2} borderBottom={'1px solid lightgray'}
                    bgColor={'#ffffffab'}
                >
                    <Box flex={1}>
                        {leftPlacedContainer}
                    </Box>
                    <Box w={'max-content'}>
                        {rightPlacedButtons}
                    </Box>
                </Box>
                <Box className="s-content" w={'full'} h={'full'} flex={1} overflow={'auto'}>
                    <Box className="list" w={'full'} h={'full'} p={isMobile ? 0 : 2} justifyContent={'center'}>
                        {
                            isMobile ? mobileWrapper(roomsList) : roomsList
                        }
                    </Box>
                </Box>
            </Box>
        </>
    )

}

export default Section 