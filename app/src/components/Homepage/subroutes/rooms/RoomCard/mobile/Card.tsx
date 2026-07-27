
import { Accordion, Box, Button, Span, Text } from "@chakra-ui/react"
import { MotionButton } from "../../../../../../utils/objects/ui"
import { MoreHorizontal } from "lucide-react"

import RoomCardContextMenu from '../../../../contextualMenus/roomCard/Menu'
import type { ReactNode } from "react"
import type { privateRoomData } from "../../../../../../utils/types/rooms"

type props = {
    focused: string,
    value: string,
    isYours?: boolean,
    room: privateRoomData,
    eventHandlers: {
        onWouldEnter: () => void
    }
}

function Card({ focused, value, isYours = false, room, eventHandlers }: props) {

    const isFocused = focused === value

    const contextMenu = (trigger: ReactNode) => {
        return <RoomCardContextMenu trigger={trigger} isYours={isYours}
            eventHandlers={{
                onWouldEnter: eventHandlers.onWouldEnter
            }}
        />
    }

    return (
        <Accordion.Item value={value} mt={2} border={0}>
            <Accordion.ItemTrigger bgColor="#FFF0F5" border="1px solid #a3849d" borderBottomWidth={isFocused ? 0 : 1} px={3}
                borderTopLeftRadius={16} borderTopRightRadius={16} borderBottomLeftRadius={isFocused ? 0 : 16}
                borderBottomRightRadius={isFocused ? 0 : 16}
                p={3}
            >
                <Span flex="1" color="#802040" truncate>{room.name}</Span>
                <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>

            <Accordion.ItemContent
                borderRadius={isFocused ? 0 : 16} bgColor={'#ffd8e5'}
                border="1px solid #a3849d"
                borderTop={!isFocused ? 1 : 0}
                borderBottomLeftRadius={16}
                borderBottomRightRadius={16}
            >
                <Accordion.ItemBody p={4}>
                    <Box display={'flex'} gap={2} maxH={120} minH={85}>
                        <Box
                            flex={1} overflow={'auto'}
                            style={{
                                '&::WebkitScrollbar': { width: '8px', height: '8px' },
                                '&::WebkitScrollbarTrack': { background: '#f0e6f2', borderRadius: '8px' },
                                '&::WebkitScrollbarThumb': { backgroundColor: '#a1145b', borderRadius: '8px', border: '2px solid #f0e6f2' },
                                '&::WebkitScrollbarThumb:hover': { backgroundColor: '#c2186d' },
                                scrollbarWidth: 'thin', // Firefox
                                scrollbarColor: '#a1145b #f0e6f2', // Firefox
                            } as any}
                        >
                            {room.description ? (
                                <Text fontSize={'xs'}>
                                    {room.description}
                                </Text>
                            ) : (
                                <Text fontStyle={'italic'} fontSize={'xs'}>Nessuna descrizione</Text>
                            )}
                        </Box>
                        <Box
                            flex={1}
                            display={'flex'} flexDirection={'column'} alignItems={'flex-end'} justifyContent={'space-between'}
                        >
                            <Box display={'flex'} flexDirection={'column'} alignItems={'flex-end'} w={'full'} gap={2}>
                                <Box overflow={'hidden'} fontSize={'x-small'}>
                                    <Text color={'#a00050'} textAlign={'right'}>{room.members.total}&nbsp;membr{room.members.total === 1 ? 'o' : 'i'}</Text>
                                    <Text color={'#ff006f'} textAlign={'right'}>{room.members.activeNow}&nbsp;in stanza</Text>

                                </Box>
                            </Box>
                            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} w={'full'}>
                                {contextMenu(
                                    <MotionButton
                                        size={'2xs'} p={0} borderRadius={'full'} bgColor={'#a1145b'} border={'1px solid #3b001e'}
                                        whileHover={{
                                            scale: 1.05,
                                            backgroundColor: "#c2186d",
                                            rotate: 90,
                                            boxShadow: "0px 0px 8px rgba(161, 20, 91, 0.6)"
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <MoreHorizontal color='white' size={16} />
                                    </MotionButton>
                                )}
                                {isYours && (
                                    <Button size={'2xs'} variant={'ghost'} colorPalette={'pink'} borderRadius={9}>Modifica</Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Accordion.ItemBody>
            </Accordion.ItemContent>
        </Accordion.Item>
    )
}


export default Card
