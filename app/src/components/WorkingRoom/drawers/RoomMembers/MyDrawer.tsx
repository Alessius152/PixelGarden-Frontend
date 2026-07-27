import { Box, Button, Drawer, Flex, Portal, Text, Badge } from "@chakra-ui/react"
import { useMemo, type ReactNode } from "react"
import { closeIcon } from "../../../../utils/objects/svgs/icons"
import { useRealtime } from "../../../../contexts/RealtimeContext"
import { buildVoidProfilePicture, MotionButton } from "../../../../utils/objects/ui"
import { useAppAuth } from "../../../../contexts/AppAuthContext"
import type { roomMember_fromRoomDetailsFromBackend } from "../../../../utils/types/rooms"
import { useDeviceDetection } from "../../../../contexts/DeviceDetectorContext"
import { UserPlus } from "lucide-react"
import MembersToAddChoosingContextualMenu from "../../contextualMenus/MembersToInviteChoosing/ContextualMenu"

type Props = {
    trigger: ReactNode
}

function MyDrawer({ trigger }: Props) {
    const { workingRoom } = useRealtime()
    const { secondAuth } = useAppAuth()

    const { isMobile } = useDeviceDetection()

    const sortedMembers = useMemo(() => {
        if (!workingRoom.details?.data) return []

        const rawMembers = workingRoom.details.data.roomData.members

        const uniqueMembers = Array.from(
            new Map(rawMembers.map((member) => [member[0], member])).values()
        )

        return uniqueMembers.sort((a, b) => {
            const userIdA = a[0]
            const userIdB = b[0]
            const usernameA = a[1].toLowerCase()
            const usernameB = b[1].toLowerCase()

            const isOnlineA = workingRoom.members.some(m => m.data.userId === userIdA)
            const isOnlineB = workingRoom.members.some(m => m.data.userId === userIdB)

            if (isOnlineA && !isOnlineB) return -1
            if (!isOnlineA && isOnlineB) return 1

            return usernameA.localeCompare(usernameB)
        })
    }, [workingRoom.details?.data, workingRoom.members])

    const hasDuplicateUsername = (username: string) => {
        return workingRoom.members.filter(m => m.data.username === username).length > 1
    }

    const getRtMemberData = (userId: string) => {
        return workingRoom.members.find(m => m.data.userId === userId) || null
    }

    const loadMemberCard = (member: roomMember_fromRoomDetailsFromBackend) => {
        const [userId, username, { wLayerId }] = member

        const isMe = secondAuth.status === 'authenticated' && secondAuth.user.userId === userId
        const isOwner = userId === workingRoom.details?.data?.roomData.members[workingRoom.details?.data?.roomData.members.length - 1][0]

        const isDuplicate = hasDuplicateUsername(username)
        const rtMember = getRtMemberData(userId)

        const labelNode = (
            <>
                {username}
                {(isMe || isOwner) && (
                    <Text as="span" display="block" fontSize={'2xs'} fontWeight={'medium'} opacity={0.8}>
                        {(isMe && isOwner) ? '(Creatore, Tu)' :
                            isMe ? '(Tu)' :
                                isOwner ? '(Creatore)' : ''}
                    </Text>
                )}
            </>
        )

        return (
            <Box key={'room-member-card-' + userId} display={'flex'} alignItems={'center'} p={3} bgColor={rtMember ? '#f8d2ff' : 'rgba(240, 240, 240, 0.6)'}
                opacity={rtMember ? 1 : 0.7} rounded={'xl'} boxShadow={'sm'} position="relative" transition="all 0.2s" cursor={'pointer'}
                _hover={{ transform: "translateX(5px)", bgColor: rtMember ? "#f09cff" : "#e2e2e2" }}
                onClick={() => workingRoom.workingLayer.set(wLayerId)}
            >
                <Box flexShrink={0}>
                    {buildVoidProfilePicture(username, 42)}
                </Box>

                <Flex direction="column" ml={3} overflow="hidden">
                    <Box
                        fontWeight="bold"
                        fontSize="md"
                        color={rtMember ? (rtMember.data.color || 'purple.700') : 'gray.600'}
                        lineHeight="short"
                    >
                        {labelNode}
                    </Box>

                    {isDuplicate && (
                        <Text fontSize="2xs" color="gray.500" fontFamily="monospace">
                            ID: {userId.substring(0, 8)}...
                        </Text>
                    )}
                </Flex>

                <Flex direction="column" align="flex-end" ml="auto">
                    {rtMember && (
                        <Badge variant="subtle" colorPalette="purple" fontSize="9px" px={2} rounded="full" opacity={0.9}>
                            in stanza
                        </Badge>
                    )}
                    <Box mt={1} w="6px" h="6px" bg={rtMember ? 'purple.500' : 'gray.400'} rounded="full" />
                </Flex>
            </Box>
        )
    }

    if (secondAuth.status !== 'authenticated') return null
    if (!workingRoom.details?.data) return <Text p={4}>Caricamento dettagli stanza...</Text>

    return (
        <Drawer.Root placement={isMobile ? 'bottom' : 'end'}>
            <Drawer.Trigger asChild>
                {trigger}
            </Drawer.Trigger>
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content bgColor={'#fffcf5'}>
                        <Drawer.Header borderBottomWidth="1px" borderColor="rgba(0,0,0,0.05)">
                            <Drawer.Title fontWeight={'bold'} color={'#4a3728'} fontSize={'sm'}>
                                Membri della stanza ({sortedMembers.length})
                            </Drawer.Title>
                        </Drawer.Header>

                        <Drawer.Body py={4}>
                            {workingRoom.channel ? (
                                <Flex direction={'column'} gap={4}>
                                    {sortedMembers.map(loadMemberCard)}
                                </Flex>
                            ) : (
                                <Flex justify="center" align="center" h="100px" color={'#4a3728'}>
                                    <Text fontSize="sm" fontStyle="italic">Connessione in corso...</Text>
                                </Flex>
                            )}
                        </Drawer.Body>

                        <Drawer.Footer justifyContent={'space-between'} alignItems="center">

                            <Drawer.CloseTrigger asChild>
                                <Button colorPalette={'pink'} rounded={'md'} fontSize={'xs'} p={1} size={'2xs'}>
                                    {closeIcon}
                                </Button>
                            </Drawer.CloseTrigger>
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root >
    )
}

export default MyDrawer