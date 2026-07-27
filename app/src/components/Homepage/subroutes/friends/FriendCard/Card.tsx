import './Card.css'
import { useDeviceDetection } from '../../../../../contexts/DeviceDetectorContext'
import type { friendDataFromBackend } from '../../../../../utils/types/friends'
import { otherIcon } from '../../../../../utils/objects/svgs/icons'
import { buildVoidProfilePicture, MotionBox } from '../../../../../utils/objects/ui'
import { Box, Flex, IconButton, Text } from '@chakra-ui/react'
import { type ReactNode, memo } from 'react'

import FriendCardContextMenu from '../../../contextualMenus/friendCard/Menu'

function Card(
    { friendData }: {
        friendData: friendDataFromBackend,
    }
) {
    const { isResolved, isMobile, isDesktop } = useDeviceDetection()

    if (!isResolved) return null

    const { friend, isOnline } = friendData
    const profilePicSize = isMobile ? 32 : 64
    const avatar = buildVoidProfilePicture(friend, profilePicSize)
    const contextMenu = (trigger: ReactNode) => {
        return <FriendCardContextMenu trigger={trigger} friend={friendData} />
    }

    const card = (
        <MotionBox
            className={`friends-list-card ${isDesktop ? 'desktop' : ''}`}
            style={{
                maxWidth: isDesktop ? '248px' : undefined,
                minWidth: (isDesktop ? '248px' : '100%')
            }}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }} 
        >
            <Flex alignItems={'center'} justifyContent={'space-between'} gap={4}>
                <Flex gap={3} alignItems={'center'} flex={1} overflow={'hidden'}>
                    <Box pos={'relative'}>
                        {avatar}
                        <Box
                            position="absolute" bottom="2px" right="2px" width={isMobile ? '6px' : '12px'} height={isMobile ? '6px' : '12px'}
                            borderRadius="full" border={`${isMobile ? 1 : 2}px solid white`} bg={isOnline ? '#ff37c6ff' : '#561635ff'}
                        />
                    </Box>
                    <Text fontSize={'lg'} fontWeight={'medium'} truncate={true}>{friend + ''}</Text>
                </Flex>
                {
                    (!isDesktop) ? contextMenu(
                        <IconButton colorPalette={'purple'} variant={'surface'} borderRadius={12} size={isMobile ? 'xs' : 'md'}>
                            {otherIcon}
                        </IconButton>
                    ) : null
                }
            </Flex>
        </MotionBox>
    )

    if (isDesktop) {
        return contextMenu(card)
    }

    return card

}

export default memo(Card)
