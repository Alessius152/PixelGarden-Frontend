import { Menu, Text, Box, VStack, HStack, Checkbox, Button } from "@chakra-ui/react"
import { useState, useMemo } from "react"
import { useRealtime } from "../../../../contexts/RealtimeContext"
import type { pixelartCollaboratorsListFromBackend } from "../../../../utils/types/arts"

type Props = {
    artCollaborators: pixelartCollaboratorsListFromBackend | undefined
    trigger: React.ReactNode
    onConfirm: (selectedIds: string[]) => void
}

function ContextualMenu({ artCollaborators, trigger, onConfirm }: Props) {
    const { workingRoom } = useRealtime()
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const availableMembersData = useMemo(() => {
        const members = workingRoom.details?.data?.roomData.members || []
        const existingCollabIds = new Set(artCollaborators?.collaborators.map(c => c[0]) || [])

        return members
            .filter(m => !existingCollabIds.has(m[0]))
            .map(m => ({ userId: m[0], username: m[1], membershipId: m[2]?.mId }))
            .filter(m => m.membershipId)
    }, [workingRoom.details, artCollaborators])

    const toggleSelection = (mId: string) => {
        setSelectedIds(prev =>
            prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
        )
    }

    const handleConfirm = () => {
        onConfirm(selectedIds)
        setSelectedIds([])
    }

    return (
        <Menu.Root closeOnSelect={false}>
            <Menu.Trigger asChild>
                {trigger}
            </Menu.Trigger>

            <Menu.Positioner zIndex={9999}>
                <Menu.Content minW="280px" p={1} boxShadow="2xl" borderRadius="xl" bg="white">
                    <Box px={3} py={2} borderBottomWidth="1px" borderColor="gray.100">
                        <Text fontWeight="bold" fontSize="xs" color="gray.500">
                            SELEZIONA COLLABORATORI ({selectedIds.length})
                        </Text>
                    </Box>

                    <VStack gap={0} mt={1} maxH="240px" overflowY="auto">
                        {availableMembersData.length > 0 ? (
                            availableMembersData.map((member) => {
                                const isDuplicate = availableMembersData.filter(m => m.username === member.username).length > 1
                                const isChecked = selectedIds.includes(member.membershipId)

                                return (
                                    <Menu.Item key={member.membershipId} value={member.membershipId} closeOnSelect={false}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            toggleSelection(member.membershipId)
                                        }}
                                        _hover={{ bg: "pink.50" }} p={2} borderRadius="md" cursor="pointer"
                                    >
                                        <HStack gap={3} w="full">
                                            <Checkbox.Root checked={isChecked} colorPalette="pink" size="sm">
                                                <Checkbox.HiddenInput />
                                                <Checkbox.Control />
                                            </Checkbox.Root>

                                            <VStack align="start" gap={0} flex="1">
                                                <Text fontSize="sm" fontWeight="medium" color="gray.800">
                                                    {member.username}
                                                </Text>
                                                {isDuplicate && (
                                                    <Text fontSize="10px" color="gray.400">
                                                        {member.userId.substring(0, 5)}...
                                                    </Text>
                                                )}
                                            </VStack>
                                        </HStack>
                                    </Menu.Item>
                                )
                            })
                        ) : (
                            <Text p={4} fontSize="xs" color="gray.400" textAlign="center">Nessun membro disponibile</Text>
                        )}
                    </VStack>

                    {availableMembersData.length > 0 && (
                        <Box p={2} borderTopWidth="1px" borderColor="gray.100">
                            <Button colorPalette="pink" size="sm" w="full" disabled={selectedIds.length === 0} fontWeight="bold" onClick={handleConfirm}>
                                Autorizza ({selectedIds.length})
                            </Button>
                        </Box>
                    )}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    )
}

export default ContextualMenu