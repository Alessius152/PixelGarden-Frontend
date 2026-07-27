import { Box, Flex, Text } from "@chakra-ui/react"
import { buttonWithGrandientOnHover } from "../../../../../../../utils/objects/ui"
import { checkIcon, dislikeIcon } from "../../../../../../../utils/objects/svgs/icons"
import { useDeviceDetection } from "../../../../../../../contexts/DeviceDetectorContext"

import { cherryFlowers } from '../../../../../../../utils/objects/svgs/icons'
import type { receivedJoiningInvite } from "../../../../../../../utils/types/rooms"
import { useMemo } from "react"

type props = {
    invite: receivedJoiningInvite
}

const { _01, _02, _03 } = cherryFlowers.receivedRoomJoiningInvites
const pics = [_01, _02, _03]

function Card({ invite }: props) {

    const { isMobile } = useDeviceDetection()
    
    const randPic = useMemo(() => {
        return pics[Math.floor(Math.random() * pics.length)]
    }, [])

    return (
        <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}
            p={2} borderRadius={16} gap={0}
            background={'linear-gradient(165deg, #ffacc8, #ffd4d4d9)'}
        >
            <Box>
                <Box color={'#692e34'} fontSize={isMobile ? 'xs' : 'md'} lineHeight={isMobile ? 1.10 : 'auto'}
                    display={'flex'} alignItems={'center'} gap={2}
                >
                    {randPic}
                    <Text>
                        <b>{invite.inviterUname}</b> ti ha invitato a far parte di <b>{invite.name}</b>
                    </Text>
                </Box>
            </Box>
            <Flex alignItems={'center'} justifyContent={'flex-end'} gap={1}>
                {buttonWithGrandientOnHover(dislikeIcon, 'Rifiuta', {
                    bgColor: 'red.400',
                    size: isMobile ? '2xs' : 'xs',
                    fontSize: isMobile ? 'xx-small' : 'sm',
                    whileHover: { scale: 1.05 },
                }, ['#f11c58', '#ff6f6f', '#c2001d'])}
                {buttonWithGrandientOnHover(checkIcon, 'Accetta', {
                    bgColor: '#802040',
                    size: isMobile ? '2xs' : 'xs',
                    fontSize: isMobile ? 'xx-small' : 'sm',
                    whileHover: { scale: 1.05 },
                }, ['#482f37', '#d44f7b', '#400519'])}
            </Flex>
        </Box>
    )
}

export default Card
