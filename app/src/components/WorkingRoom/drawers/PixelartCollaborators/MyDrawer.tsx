import { Box, Button, Drawer, Flex, Portal, Text, Badge, VStack, Icon, Spinner } from "@chakra-ui/react"
import { closeIcon } from "../../../../utils/objects/svgs/icons"
import { buildVoidProfilePicture } from "../../../../utils/objects/ui"
import { useRoomUI } from "../../../../containers/WorkingRoom/Room"
import type { artCreationDataBE, artMetadataFromBackend, pixelartCollaboratorsListFromBackend } from "../../../../utils/types/arts"
import type { AxiosError } from "axios"
import { SERVER_BASE_URL } from "../../../../utils/objects/constants"
import axios from "axios"
import { useAppAuth } from "../../../../contexts/AppAuthContext"
import { useRealtime } from "../../../../contexts/RealtimeContext"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { signHttpHeaderWithFirebaseJwtToken } from "../../../../services/firebase/authentication"
import { UserPlus } from "lucide-react"
import AddArtCollaboratorsContextualMenu from "../../contextualMenus/AddArtCollaborators/ContextualMenu"
import arts from "../../../../api/arts"

const SAKURA_PINK = "#ffb7c5"
const MOSS_GREEN = "#8a9a5b"
const BARK_BROWN = "#4a3728"
const SOFT_CREAM = "#fffcf5"

type Props = {
    trigger: React.ReactNode
}

function CollaboratorsDrawer({ trigger }: Props) {
console.log("il drawer che riporta i collaboratori della pixelart")
    const { scenario } = useRoomUI()
    const { isAuthenticated, secondAuth } = useAppAuth()
    const { workingRoom } = useRealtime()

    if (!(
        (scenario[0] === 'pixelart')
        && (workingRoom.details?.data)
    )) {
        return null
    }

    const artCollaborators = useQuery<pixelartCollaboratorsListFromBackend, AxiosError>({
        queryKey: ['pixelartCollaboratorsList', scenario[1]],
        enabled: !!(isAuthenticated && (scenario[0] === 'pixelart')),
        queryFn: async ({ queryKey }) => {
            const headers = {}
            await signHttpHeaderWithFirebaseJwtToken(headers)
            try {
                const response = await axios.get(`${SERVER_BASE_URL}/arts/getArtCollaboratorsList?artId=${scenario[1]}`, { headers })
                if ('error' in response.data) { throw new Error(response.data.error) }
                return response.data
            }
            catch (err) { throw new Error(err as any) }
        },
        staleTime: Infinity,
    })

    const queryClient = useQueryClient()
    const artData = queryClient.getQueryData<artMetadataFromBackend>(['pixelartMetadata', scenario[1]])

    if ((secondAuth.status !== 'authenticated') || (!artData)) return

    const isArtCreator = artData.artOwner[0] === secondAuth.user.userId

    const loadCollaboratorCard = (collab: [string, string]) => {
        const [userId, username] = collab

        if (!(secondAuth.status === 'authenticated')) {
            return <></>
        }

        return (
            <Box
                w={'full'}
                key={'art-collab-card-' + userId}
                display={'flex'} alignItems={'center'} px={4} py={2.5} bgColor={'rgba(255, 183, 197, 0.15)'} border="1px solid" borderColor={SAKURA_PINK}
                rounded={'xl'} position="relative" cursor={'pointer'}
                transition="transform 0.3s cubic-bezier(.4,0,.2,1),boxShadow 0.3s cubic-bezier(.4,0,.2,1),borderColor 0.3s cubic-bezier(.4,0,.2,1)"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: MOSS_GREEN }}
            >
                <Box position="relative" flexShrink={0}>
                    {buildVoidProfilePicture(username, 42)}
                </Box>

                <Flex direction="column" ml={3} flex="1">
                    <Flex alignItems={'center'} gap={2}>
                        <Text fontWeight="bold" fontSize="sm" color={BARK_BROWN} lineHeight="short">
                            {username}
                        </Text>
                        {(secondAuth.user.userId === userId) && (
                            <Badge bg={SAKURA_PINK} color="white" fontSize="8px" px={1} borderRadius="md">
                                TU
                            </Badge>
                        )}
                    </Flex>
                </Flex>

                <VStack align="flex-end" justify="center">
                    {workingRoom.members.some(m => m.data.userId === userId) && (
                        <Badge fontSize="10px" variant="plain" color="#ff008c" fontWeight="bold">
                            • Attivo
                        </Badge>
                    )}
                </VStack>
            </Box>
        )
    }

    const handleAddCollaborators = async (membershipsId: Array<string>) => {
        const response = await arts.addCollaborators({ artId: scenario[1], membershipsId })

        if ('networkError' in response) {
            //errore di rete
            return
        }

        if ('error' in response.data) {
            //errore dal server
            return
        }

        const { count } = response.data
    }

    return (
        <Drawer.Root size="sm">
            <Drawer.Trigger asChild>
                {trigger}
            </Drawer.Trigger>
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content
                        bgColor={SOFT_CREAM}
                        borderLeft="4px solid"
                        borderColor={SAKURA_PINK}
                        boxShadow="-10px 0 20px rgba(74, 55, 40, 0.05)"
                    >
                        <Drawer.Header borderBottomWidth="1px" borderColor="rgba(138, 154, 91, 0.1)">
                            <VStack align="start" gap={0}>
                                <Drawer.Title fontWeight={'bold'} color={'#4a3728'} fontSize={'sm'}>
                                    Collaboratori disegno
                                </Drawer.Title>
                            </VStack>
                        </Drawer.Header>

                        <Drawer.Body py={6}>
                            <Flex direction={'column'} gap={3} alignItems={(artCollaborators.isLoading || artCollaborators.error) ? 'center' : 'flex-start'}>
                                {
                                    artCollaborators.isLoading ? <Spinner color='var(--color-sakura-deep)' size='xl' /> : (
                                        artCollaborators.error ? <>download error</> : (
                                            artCollaborators.data &&
                                            artCollaborators.data.collaborators
                                                .sort((a, b) => a[1].localeCompare(b[1]))
                                                .map((c) => loadCollaboratorCard([c[0], c[1]]))
                                        )
                                    )
                                }
                            </Flex>
                        </Drawer.Body>

                        <Drawer.Footer borderTopWidth="1px" borderColor="rgba(138, 154, 91, 0.1)" justifyContent={'center'} p={4}>
                            <Drawer.CloseTrigger asChild>
                                <Button colorPalette={'pink'} rounded={'md'} size={'xs'}>
                                    {closeIcon} Chiudi
                                </Button>
                            </Drawer.CloseTrigger>
                            {isArtCreator && <AddArtCollaboratorsContextualMenu
                                artCollaborators={artCollaborators.data}
                                trigger={(
                                    <Button colorPalette={'pink'} variant={'subtle'} rounded={'xl'} size={'md'} border={'1px solid #db005b50'}>
                                        <UserPlus /> Add collaborators
                                    </Button>
                                )}
                                onConfirm={(membershipsId) => {
                                    handleAddCollaborators(membershipsId)
                                }}
                            />}
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}

export default CollaboratorsDrawer