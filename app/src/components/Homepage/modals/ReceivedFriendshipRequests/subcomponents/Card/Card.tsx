
import { Flex, Text } from '@chakra-ui/react'
import './Card.css'
import { buildVoidProfilePicture, buttonWithGrandientOnHover, MotionBox } from '../../../../../../utils/objects/ui'
import { dislikeIcon, likeIcon, mailIcon } from '../../../../../../utils/objects/svgs/icons'
import { useDeviceDetection } from '../../../../../../contexts/DeviceDetectorContext'
import type { friendDataFromBackend, FriendshipRequestAnswer, receivedFriendshipRequestFromBackend } from '../../../../../../utils/types/friends'
import friendsApi from '../../../../../../api/friends'
import { useState } from 'react'
import { useFriendshipRequestsContext } from '../../../../../../contexts/FriendshipRequestsContext'
import { useFriendsContext } from '../../../../../../contexts/FriendsContext'
import { snackbarsByAction } from '../../../../../../utils/objects/ui/toasterSnackbars'

function Card(
    { data }: {
        data: receivedFriendshipRequestFromBackend
    }
) {

    const { isResolved, isMobile, isDesktop, isTablet } = useDeviceDetection()
    const { receivedReqsMethods } = useFriendshipRequestsContext()
    const { methods } = useFriendsContext()

    const [isLoading, setIsLoading] = useState(false)

    if (!isResolved) {
        return null
    }

    const leftBox = isMobile ? (
        <>
            <Flex direction={'column'} flex={1} p={1} gap={2}>
                <Flex alignItems={'center'} gap={2}>
                    {buildVoidProfilePicture('username01', isMobile ? 32 : 46, { boxShadow: '2px 2px 4px 2px gray' })}
                    <div>
                        <Text fontSize={isMobile ? 'md' : 'lg'} color={'#46159a'} fontWeight={'bold'} truncate={true}>{data.sender}</Text>
                        <Text fontSize={isMobile ? 'x-small' : 'sm'} color={'#242424'} fontWeight={'normal'} truncate={true}>{data.senderId}</Text>
                    </div>
                </Flex>
                <Flex
                    marginLeft={1}
                    alignItems={'center'} gap={1} fontSize={isMobile ? 'x-small' : 'sm'}
                    color={'#242424'} fontWeight={'normal'} truncate={true}
                >
                    <div style={{ width: 16, height: 16 }}>{mailIcon}</div>
                    {'data.at'}
                </Flex>
            </Flex>
        </>
    ) : (
        <>
            {buildVoidProfilePicture('username01', isMobile ? 32 : 46, { boxShadow: '2px 2px 4px 2px gray' })}
            <Flex direction={'column'} justifyContent={'center'} flex={1} overflow={'hidden'} gap={3}>
                <div>
                    <Text fontSize={isMobile ? 'md' : 'lg'} color={'#46159a'} fontWeight={'bold'} truncate={true}>{data.sender}</Text>
                    <Text fontSize={isMobile ? 'x-small' : 'sm'} color={'#242424'} fontWeight={'normal'} truncate={true}>{data.senderId}</Text>
                </div>
                <Flex
                    alignItems={'center'} gap={1} fontSize={isMobile ? 'x-small' : 'sm'}
                    color={'#242424'} fontWeight={'normal'} truncate={true}
                >
                    <div style={{ width: 16, height: 16 }}>{mailIcon}</div>
                    {'data.ai'}
                </Flex>
            </Flex>
        </>
    )

    return (
        <MotionBox
            w={'full'} p={isMobile ? 2 : 4} className=' received-f-requests-list-item' display={'flex'} alignItems={'center'} borderRadius={16} gap={4}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {leftBox}
            <Flex direction={'column'} gap={2}>
                {buttonWithGrandientOnHover(likeIcon, 'Accetta', {
                    colorPalette: 'green',
                    size: isMobile ? '2xs' : 'xs',
                    fontSize: isMobile ? 'xx-small' : 'sm',
                    loading: isLoading,
                    whileHover: { scale: 1.05 },
                    onClick: () => handleAnswer(1)
                }, ['#576f3b', '#249b19', '#00ce78'])}

                {buttonWithGrandientOnHover(dislikeIcon, 'Rifiuta', {
                    colorPalette: 'red',
                    size: isMobile ? '2xs' : 'xs',
                    fontSize: isMobile ? 'xx-small' : 'sm',
                    loading: isLoading,
                    whileHover: { scale: 1.05 },
                    onClick: () => handleAnswer(0)
                }, ['#965555', '#ff3131', '#7d0d00'])}
            </Flex>
        </MotionBox>
    )

    async function handleAnswer(answer: FriendshipRequestAnswer) {
        setIsLoading(true)
        const response = await friendsApi.answerToRequest(data.requestId, answer)
        setIsLoading(false)

        if ('error' in response) {
            if (response.error.type === 'network') {
                snackbarsByAction({ isDesktop, isMobile, isTablet }).answerToReceivedFriendshipRequest.err.network(response.error.ref)
            }
            else {
                snackbarsByAction({ isDesktop, isMobile, isTablet }).answerToReceivedFriendshipRequest.err.server(response.error.ref.data.error)
            }
            return
        }

        receivedReqsMethods.cancelReceivedReq(data.requestId)

        if (answer === 1) {
            const userData = response.data.friendship.newFriend as friendDataFromBackend
            methods.addFriendManually(userData)
            snackbarsByAction({ isDesktop, isMobile, isTablet }).answerToReceivedFriendshipRequest.success(userData.friend)
        }

    }

}

export default Card
