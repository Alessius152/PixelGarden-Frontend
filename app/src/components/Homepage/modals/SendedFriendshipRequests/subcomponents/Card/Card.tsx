import { Box, Flex, Text } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../../../contexts/DeviceDetectorContext'
import './Card.css'
import { buildVoidProfilePicture, buttonWithGrandientOnHover } from '../../../../../../utils/objects/ui'
import { closeIcon, telegramIcon } from '../../../../../../utils/objects/svgs/icons'
import type { sentFriendshipRequestFromBackend } from '../../../../../../utils/types/friends'
import friendsApi from '../../../../../../api/friends'
import { useState, type ReactNode } from 'react'
import { useFriendshipRequestsContext } from '../../../../../../contexts/FriendshipRequestsContext'
import { snackbarsByAction } from '../../../../../../utils/objects/ui/toasterSnackbars'

function Card({ data }: { data: sentFriendshipRequestFromBackend }) {

    const { isResolved, isMobile, isDesktop, isTablet } = useDeviceDetection()
    const { sentReqsMethods } = useFriendshipRequestsContext()

    const [isLoading, setIsLoading] = useState(false)

    if (!isResolved) {
        return null
    }

    const leftBox = isMobile ? (
        <>
            <Flex direction={'column'} flex={1} p={1} gap={2} overflow={'hidden'}>
                <Flex alignItems={'center'} gap={2}>
                    {buildVoidProfilePicture('username01', isMobile ? 32 : 46, { boxShadow: '2px 2px 4px 2px gray' })}
                    <div style={{ width: '100%', overflow: 'hidden' }}>
                        <Text fontSize={isMobile ? 'md' : 'lg'} color={'#46159a'} fontWeight={'bold'} truncate={true}>{data.receiver}</Text>
                        <Text fontSize={isMobile ? 'x-small' : 'sm'} color={'#242424'} fontWeight={'normal'} truncate={true}>{data.receiverId}</Text>
                    </div>
                </Flex>
                <Flex
                    marginLeft={1}
                    alignItems={'center'} gap={1} fontSize={isMobile ? 'x-small' : 'sm'}
                    color={'#242424'} fontWeight={'normal'} truncate={true}
                >
                    <div style={{ width: 16, height: 16 }}>{telegramIcon}</div>
                    {'data.at'}
                </Flex>
            </Flex>
        </>
    ) : (
        <>
            {buildVoidProfilePicture('username01', isMobile ? 32 : 46, { boxShadow: '2px 2px 4px 2px gray' })}
            <Flex direction={'column'} justifyContent={'center'} flex={1} overflow={'hidden'} gap={3}>
                <div>
                    <Text fontSize={isMobile ? 'md' : 'lg'} color={'#46159a'} fontWeight={'bold'} truncate={true}>{data.receiver}</Text>
                    <Text fontSize={isMobile ? 'x-small' : 'sm'} color={'#242424'} fontWeight={'normal'} truncate={true}>{data.receiverId}</Text>
                </div>
                <Flex
                    alignItems={'center'} gap={1} fontSize={isMobile ? 'x-small' : 'sm'}
                    color={'#242424'} fontWeight={'normal'} truncate={true}
                >
                    <div style={{ width: 16, height: 16 }}>{telegramIcon}</div>
                    {'data.at'}
                </Flex>
            </Flex>
        </>
    )

    return (
        <Box w={'full'} p={isMobile ? 2 : 4} className='sended-f-requests-list-item' display={'flex'} alignItems={'center'} borderRadius={16} gap={4}>
            {leftBox}
            <Flex direction={'column'} gap={2}>
                {buttonWithGrandientOnHover(closeIcon, 'Annulla', {
                    colorPalette: 'teal',
                    size: isMobile ? '2xs' : 'xs',
                    fontSize: isMobile ? 'xx-small' : 'sm',
                    loading: isLoading,
                    whileHover: { scale: 1.05 },
                    onClick: handleCancelRequest
                }, ['#00c6ff', '#0072ff', '#00c6ff'])}
            </Flex>
        </Box>
    )

    async function handleCancelRequest() {

        const { requestId } = data

        setIsLoading(true)
        const response = await friendsApi.cancelSentRequest(requestId)
        setIsLoading(false)

        if ('error' in response) {
            if(response.error.type === 'server'){
                snackbarsByAction({isDesktop,isMobile,isTablet}).cancelSentFriendshipRequest.err.server(response.error.ref)
            }
            else {
                snackbarsByAction({isDesktop,isMobile,isTablet}).cancelSentFriendshipRequest.err.network(response.error.ref)
            }
            return
        }

        sentReqsMethods.cancelSentReq(requestId)

    }

}

export default Card