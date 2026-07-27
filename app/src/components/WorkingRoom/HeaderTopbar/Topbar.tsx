import { Box, Button, Flex, Separator, Skeleton, Text } from "@chakra-ui/react"
import { Flower, Menu, UserPlus } from "lucide-react"
import type { roomDetailsFromBackend } from "../../../utils/types/rooms"
import { useDeviceDetection } from "../../../contexts/DeviceDetectorContext"
import MiniMenu from "../contextualMenus/MobileTopbarOtherBtn/MiniMenu"
import RoomMembersBtn from "../buttons/RoomMembrersView"
import SavePixelartBtn from "../buttons/SavePixelartBtn"
import TurnHomeBtn from "../buttons/TurnBackBtn"
import Footer from "../Footer/Footer"
import ArtCollaboratorsBtn from "../buttons/ArtCollaborators"
import TurnWorkingLayersViewBtn from "../buttons/TurnWorkingLayersViewBtn"
import { useRoomUI } from "../../../containers/WorkingRoom/Room"
import MembersToAddChoosingContextualMenu from "../contextualMenus/MembersToInviteChoosing/ContextualMenu"
import { MotionButton } from "../../../utils/objects/ui"
import { useAppAuth } from "../../../contexts/AppAuthContext"

type Props = {
    roomDetails: {
        isLoading: boolean,
        data: roomDetailsFromBackend | undefined
    },
}

function Topbar({ roomDetails }: Props) {
    const { isMobile } = useDeviceDetection()
    const { scenario, setScenario } = useRoomUI()
    const { secondAuth } = useAppAuth()

    if (!roomDetails.data) {
        return null
    }

    if (!(secondAuth.status === 'authenticated')) {
        return null
    }

    const { roomData: { basic: [uuid, name, description], members } } = roomDetails.data as roomDetailsFromBackend

    const headerFlowerIcon = (
        <Box w={8} h={8} minW={8} bg={'var(--color-sakura-base)'} rounded={'lg'} display={'flex'} alignItems={'center'} justifyContent={'center'} color={'white'} shadow={'md'}>
            <Flower size={16} />
        </Box>
    )

    const isRoomOwner = members[members.length - 1][0] === secondAuth.user.userId

    return (
        <Flex direction={'column'} w="full">
            <Flex alignItems={'center'} justifyContent={'space-between'} p={2} borderBottom={'2px solid var(--color-sakura-base)'} userSelect={'none'} gap={isMobile ? 2 : 12} w="full">
                <Flex alignItems={'center'} gap={isMobile ? 2 : 4} justifyContent={isMobile ? 'space-between' : 'flex-start'} flex={1} minW={0}>
                    {headerFlowerIcon}
                    <Box flex={1} minW={0}>
                        <Text fontWeight={'bold'} fontSize={isMobile ? 'sm' : 'lg'} truncate display={'block'}>
                            {roomDetails.isLoading ? <Skeleton>Nome stanza</Skeleton> : name}
                        </Text>
                    </Box>
                    {isMobile && (
                        <MiniMenu
                            trigger={
                                <Button size={'sm'} aspectRatio={'1'} rounded={'lg'} colorPalette={'pink'}>
                                    <Menu size={16} />
                                </Button>
                            }
                        />
                    )}
                </Flex>
                <Flex alignItems={'center'} gap={2} display={isMobile ? 'none' : 'flex'} flexShrink={0}>
                    <Box display={'flex'} alignItems={'center'} gap={2}>
                        {isRoomOwner && (
                            <MembersToAddChoosingContextualMenu
                                trigger={
                                    <MotionButton size={'xs'} rounded={'lg'} bgColor={'#ffc4f2'} display="flex" alignItems="center"
                                        justifyContent="center" whileHover={{ backgroundColor: "#ff95e5" }} transition={{ duration: 0.2 }}
                                        color={'brown'}
                                    >
                                        <UserPlus color="brown" size={16} />
                                        Aggiungi
                                    </MotionButton>
                                }
                            />
                        )}
                        <RoomMembersBtn />
                        {(scenario[0] === 'pixelart') && <ArtCollaboratorsBtn />}
                        <Separator orientation="vertical" height="10" />
                    </Box>
                    <Box display={'flex'} alignItems={'center'} gap={1}>
                        {/* <SettingsBtn /> */}
                        {(scenario[0] === 'working-layer') ? (
                            <TurnHomeBtn />
                        ) : (
                            <TurnWorkingLayersViewBtn handleClick={() => {
                                setScenario(['working-layer'])
                            }} />
                        )}
                    </Box>
                </Flex>
            </Flex>

            {isMobile && <Footer />}
        </Flex>
    )
}

export default Topbar