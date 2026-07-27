import { Button, Checkbox, Flex, Menu, Portal, Spinner, Text, Box, Separator, VStack } from "@chakra-ui/react"
import { useState, useMemo } from "react"
import { useFriendsContext } from "../../../../contexts/FriendsContext"
import { buildVoidProfilePicture } from "../../../../utils/objects/ui"
import { inviteFriendsIntoARoom } from "../../../../api/rooms"
import { useRealtime } from "../../../../contexts/RealtimeContext"
import { snackbarsByAction } from "../../../../utils/objects/ui/toasterSnackbars"
import { useDeviceDetection } from "../../../../contexts/DeviceDetectorContext"

type Props = {
    trigger: React.ReactNode
}

function ContextualMenu({ trigger }: Props) {
    const { friends, isLoading, error } = useFriendsContext()
    const { workingRoom } = useRealtime()

    const deviceDet = useDeviceDetection()

    const [isOpen, setIsOpen] = useState(false)
    const [friendsToInvite, setFriendsToInvite] = useState<Array<string>>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const canSubmit = friendsToInvite.length > 0 && !isSubmitting

    const handleInviteFriends = async () => {
        if (!workingRoom.details?.data || !canSubmit) return

        setIsSubmitting(true)
        try {
            const response = await inviteFriendsIntoARoom(
                workingRoom.details.data.roomData.basic[0],
                friendsToInvite
            )

            if ('networkError' in response) {
                snackbarsByAction(deviceDet).inviteFriendsIntoAPrivateRoom.err.network(response.networkError)
                return
            }

            if ('error' in response.data) {
                snackbarsByAction(deviceDet).inviteFriendsIntoAPrivateRoom.err.server(response.data.error)
                return
            }

            const { invitesSent } = response.data

            setIsOpen(false)
            setFriendsToInvite([])
            snackbarsByAction(deviceDet).inviteFriendsIntoAPrivateRoom.success(invitesSent)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Menu.Root
            open={isOpen}
            onOpenChange={(e) => setIsOpen(e.open)}
            closeOnSelect={false}
            positioning={{ placement: "bottom-end" }}
        >
            <Menu.Trigger asChild>{trigger}</Menu.Trigger>

            <Portal>
                <Menu.Positioner zIndex={2500}>
                    <Menu.Content
                        minW="240px"
                        maxW="300px"
                        p={2}
                        boxShadow="lg"
                        borderRadius="xl"
                        overflow="hidden"
                    >
                        <Box px={2} py={1}>
                            <Text fontWeight="bold" fontSize="xs" color="fg.muted">
                                Invita Amici
                            </Text>
                        </Box>

                        <Separator my={1} opacity={0.5} />

                        {/* Area scrollabile per la lista */}
                        <VStack
                            maxH="240px"
                            overflowY="auto"
                            gap={0}
                            css={{
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' }
                            }}
                        >
                            {isLoading ? (
                                <Flex py={4} justify="center" w="full"><Spinner size="xs" /></Flex>
                            ) : friends.length === 0 ? (
                                <Text p={4} fontSize="2xs" color="fg.subtle" textAlign="center">
                                    Nessun amico trovato
                                </Text>
                            ) : (
                                friends.map(f => (
                                    <Menu.Item
                                        value={f.friendId}
                                        key={f.friendId}
                                        cursor="pointer"
                                        _hover={{ bg: "bg.muted" }}
                                        rounded="md"
                                        px={2}
                                        py={1.5}
                                    >
                                        <Flex align="center" gap={3} w="full">
                                            {buildVoidProfilePicture(f.friend, 24)}
                                            <Text fontSize="xs" fontWeight="medium" truncate flex={1}>
                                                {f.friend}
                                            </Text>
                                            <Checkbox.Root
                                                size="sm"
                                                checked={friendsToInvite.includes(f.relationId)}
                                                onCheckedChange={({ checked }) => {
                                                    setFriendsToInvite(prev =>
                                                        checked
                                                            ? [...prev, f.relationId]
                                                            : prev.filter(id => id !== f.relationId)
                                                    )
                                                }}
                                            >
                                                <Checkbox.HiddenInput />
                                                <Checkbox.Control colorPalette="purple" />
                                            </Checkbox.Root>
                                        </Flex>
                                    </Menu.Item>
                                ))
                            )}
                        </VStack>

                        <Separator my={1} opacity={0.5} />

                        <Box p={1}>
                            <Button
                                size="sm"
                                colorPalette="purple"
                                variant="solid"
                                w="full"
                                h="32px"
                                loading={isSubmitting}
                                disabled={friendsToInvite.length === 0}
                                onClick={handleInviteFriends}
                                fontSize="2xs"
                            >
                                Invia Inviti {friendsToInvite.length > 0 && `(${friendsToInvite.length})`}
                            </Button>
                        </Box>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    )
}

export default ContextualMenu