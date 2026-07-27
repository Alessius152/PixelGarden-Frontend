import { Box, Flex, Text } from "@chakra-ui/react"
import { buttonWithGrandientOnHover } from "../../../../../../../utils/objects/ui"
import { closeIcon } from "../../../../../../../utils/objects/svgs/icons"
import { useDeviceDetection } from "../../../../../../../contexts/DeviceDetectorContext"
import type { sentJoiningInvite } from "../../../../../../../utils/types/rooms"

type props = {
    invite: sentJoiningInvite
}

function Card({ invite }: props) {

    const { isResolved, isMobile } = useDeviceDetection()

    if (!isResolved) {
        return null
    }

    const date = new Date(invite.createdAt)

    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return (
        <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}
            p={4} borderRadius={16} gap={isMobile ? 4 : 8}
            background={'linear-gradient(165deg, #ffacc8, #ffd4d4d9)'}
        >
            <Box>
                <Box color={'#692e34'} fontSize={isMobile ? 'xs' : 'sm'} lineHeight={isMobile ? 1.10 : 'auto'}
                    display={'flex'} alignItems={'center'} gap={2}
                >
                    <Text>
                        Hai invitato <b>{invite.invitee}</b> <br />in <b>{invite.room}</b> <br />in data <b>{day}/{month}/{year}</b> alle <b>{hours}:{minutes}</b>
                    </Text>
                </Box>
            </Box>
            <Flex alignItems={'center'} justifyContent={'flex-end'} gap={1}>
                {buttonWithGrandientOnHover(closeIcon, 'Annulla invito', {
                    bgColor: 'red.400',
                    size: isMobile ? '2xs' : 'xs',
                    fontSize: isMobile ? 'xx-small' : 'sm',
                    whileHover: { scale: 1.05 },
                }, ['#f11c58', '#ff6f6f', '#c2001d'])}
            </Flex>
        </Box>
    )

}

export default Card
