
import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { useDeviceDetection } from "../../../../../../contexts/DeviceDetectorContext"
import { Edit, MoreHorizontal } from "lucide-react"
import { MotionButton } from "../../../../../../utils/objects/ui"
import type { ReactNode } from "react"

import RoomCardContextMenu from '../../../../contextualMenus/roomCard/Menu'
import type { privateRoomData } from "../../../../../../utils/types/rooms"

type props = {
    isYours?: boolean,
    room: privateRoomData,
    eventHandlers: {
        onWouldEnter: () => void
    }
}

function Card({ isYours = false, room, eventHandlers }: props) {

    const { isResolved, isTablet } = useDeviceDetection()

    if (!isResolved) {
        return null
    }

    const contextMenu = (trigger: ReactNode) => {
        return <RoomCardContextMenu trigger={trigger} isYours={isYours}
            eventHandlers={{
                onWouldEnter: eventHandlers.onWouldEnter
            }}
        />
    }

    return (
        <Flex w={'full'} h={'max-content'} maxHeight={145} bgColor={'#FFF0F5'} border={'1px solid #a3849d'} borderRadius={24} direction={'column'} p={2}>
            <Box p={2}>
                <Text paddingInline={2} fontWeight={'bold'} fontSize={isTablet ? 'sm' : 'lg'}
                    truncate={true}
                    color={'#802040'}
                >{room.name}</Text>
            </Box>
            <Flex paddingInline={isTablet ? 2 : 4} h={'full'} gap={1} overflow={'auto'}>
                <Flex flex={1} direction={'column'} gap={1}>
                    <Box
                        flex={1}
                        paddingRight={2}
                        wordBreak={'break-all'}
                        overflow={'auto'}
                        style={{
                            '&::WebkitScrollbar': { width: '8px', height: '8px' },
                            '&::WebkitScrollbarTrack': { background: '#f0e6f2', borderRadius: '8px' },
                            '&::WebkitScrollbarThumb': { backgroundColor: '#a1145b', borderRadius: '8px', border: '2px solid #f0e6f2' },
                            '&::WebkitScrollbarThumb:hover': { backgroundColor: '#c2186d' },
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#a1145b #f0e6f2', 
                        } as any}
                    >
                        {room.description ? (
                            <Text fontSize={isTablet ? 'xx-small' : 'xs'} wordBreak={'break-all'}>{room.description}</Text>
                        ) : (
                            <Text fontStyle={'italic'} fontSize={'xs'}>Nessuna descrizione</Text>
                        )}
                    </Box>
                    <Flex marginBottom={2} alignItems={'center'} justifyContent={'space-between'} paddingTop={4}>
                        {contextMenu(
                            <MotionButton
                                size={'2xs'} p={0} borderRadius={'full'} bgColor={'#a1145b'} border={'1px solid #3b001e'}
                                whileHover={{
                                    backgroundColor: "#c2186d",
                                    boxShadow: "0px 0px 8px rgba(161, 20, 91, 0.6)"
                                }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <MoreHorizontal color='white' size={16} />
                            </MotionButton>
                        )}
                        {isYours && (
                            <Button size={'2xs'} colorPalette={'pink'} borderRadius={9} variant={'subtle'} bgColor={'transparent'}><Edit/></Button>
                        )}
                    </Flex >
                </Flex>
                <Box p={2} minW={82} fontSize={isTablet ? 'xx-small' : 'xs'} gap={2} borderLeft={'1px solid lightgray'}
                    display={'flex'} flexDirection={'column'} alignItems={isTablet ? 'center' : 'flex-start'} justifyContent={'flex-start'}
                >
                    <Box overflow={'hidden'}>
                        <Text color={'#a00050'}>{room.members.total}&nbsp;membr{room.members.total === 1 ? 'o' : 'i'}</Text>
                        <Text color={'#ff006f'}>{room.members.activeNow}&nbsp;in stanza</Text>
                    </Box>
                </Box>
            </Flex>
        </Flex>
    )
}

export default Card
