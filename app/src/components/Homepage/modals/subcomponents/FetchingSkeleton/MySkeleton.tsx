import { Flex, HStack, Skeleton, SkeletonCircle, Stack } from "@chakra-ui/react";
import { useDeviceDetection } from "../../../../../contexts/DeviceDetectorContext";

function MySkeleton() {

    const {isResolved,isDesktop} = useDeviceDetection()

    if(!isResolved){
        return null
    }

    return (
        <Flex direction={'column'} gap={6}>
            {Array.from({ length: 5 }).map((value, i) => (
                <HStack gap="5" key={`sk-gl-us-sr-${i}`} animation={'linear'}>
                    <SkeletonCircle size="12" />
                    <Stack flex={1} w={isDesktop ? 350 : 150}>
                        <Skeleton height="5" />
                        <Skeleton height="5" width="80%" />
                    </Stack>
                </HStack>
            ))}
        </Flex>
    )

}

export default MySkeleton
