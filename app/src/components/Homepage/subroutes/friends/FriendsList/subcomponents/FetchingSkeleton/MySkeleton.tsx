
import { Box, Flex, HStack, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../../../../contexts/DeviceDetectorContext'

function MySkeleton() {

    const { isResolved, isMobile } = useDeviceDetection()

    const profilePicSize = isMobile ? 48 : 64

    if (!isResolved) {
        return null
    }

    const shineStyle = {
        "--start-color": "#fb9af4",
        "--end-color": "#a220b635",
    }

    return (
        <Flex gap={4} alignItems={'center'} justifyContent={'center'} flexWrap={'wrap'} h={'fit'} alignSelf={'baseline'}>
            {Array.from({ length: 20 }).map((v, i) => (
                <Box key={`f-list-item-sk-${i}`} borderWidth="1px" borderRadius={12} p={4} w={'full'} maxW={isMobile ? 'full' : "248px"} boxShadow="sm">
                    <HStack gap={4} align="center">
                        <SkeletonCircle variant="shine" animationDuration={'8s'} size={profilePicSize / 4} css={shineStyle} />
                        <Stack flex="1">
                            <Skeleton variant="shine" animationDuration={'8s'} height="5" width="80%" css={shineStyle}/>
                        </Stack>
                    </HStack>
                </Box>
            ))}
        </Flex>
    )
}

export default MySkeleton
