
import { Box, Flex, Text } from "@chakra-ui/react"
import { useDeviceDetection } from "../../../../../../contexts/DeviceDetectorContext"
import { buildVoidProfilePicture, buttonWithGrandientOnHover } from "../../../../../../utils/objects/ui"
import { telegramIcon } from "../../../../../../utils/objects/svgs/icons"
import type { globalUserSearchRecord } from "../../../../../../utils/types/global"
import friendsApi from "../../../../../../api/friends"
import { useState } from "react"
import { useFriendshipRequestsContext } from "../../../../../../contexts/FriendshipRequestsContext"
import { snackbarsByAction } from "../../../../../../utils/objects/ui/toasterSnackbars"

type props = { user: globalUserSearchRecord }

function RecordCard({ user }: props) {
    const { isMobile, isTablet, isDesktop } = useDeviceDetection()
    const { sentReqsMethods } = useFriendshipRequestsContext()

    const [isLoading, setIsLoading] = useState(false)

    const picture = buildVoidProfilePicture('username01', isMobile ? 32 : 46, { boxShadow: '2px 2px 4px 2px gray' })

    const userInfo = (
        <Flex direction={'column'} justifyContent={'center'} flex={1} overflow={'hidden'}>
            <Text fontSize={isMobile ? 'md' : 'lg'} color={'#46159a'} fontWeight={'bold'} truncate={true}>{user.username}</Text>
            <Text fontSize={isMobile ? 'x-small' : 'sm'} color={'#242424'} fontWeight={'normal'} truncate={true}>{user.userId}</Text>
        </Flex>
    )

    const sendRequestButton = buttonWithGrandientOnHover(
        telegramIcon, 'Amicizia',
        {
            colorPalette: 'teal',
            size: isMobile ? '2xs' : 'xs',
            fontSize: isMobile ? 'xx-small' : 'sm',
            loading: isLoading,
            whileHover: { scale: 1.05 },
            onClick: () => handleSend()
        },
        ['#59e4cf', '#4b5491', '#5316ad']
    )

    return (
        <Box className='global-user-search-list-item' w={'full'} p={isMobile ? 2 : 4}
            display={'flex'} alignItems={'center'} borderRadius={16} gap={4}
        >
            {picture}
            {userInfo}
            {sendRequestButton}
        </Box>
    )

    async function handleSend() {
        setIsLoading(true)
        const response = await friendsApi.sendRequest(user.uuid)
        setIsLoading(false)
        if ('error' in response) {
            if (response.error.type === 'network') {
                snackbarsByAction({ isMobile, isTablet, isDesktop }).sendFriendshipRequest.err.network(response.error.ref)
            }
            else {
                const errCode = response.error.ref.data.error
                snackbarsByAction({ isMobile, isTablet, isDesktop }).sendFriendshipRequest.err.server(errCode)
            }
            return
        }

        sentReqsMethods.addSentReq({
            requestId: response.data.relationId,
            receiver: user.username,
            receiverId: user.userId
        })
        snackbarsByAction({ isMobile, isTablet, isDesktop }).sendFriendshipRequest.success(user.username)
    }
}

export default RecordCard