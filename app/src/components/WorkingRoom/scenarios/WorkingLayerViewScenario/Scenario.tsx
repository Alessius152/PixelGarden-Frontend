
/*
questo scenario rappresenta la view che visualizzo quando mi trovo su un working layer e devo scegliere quale pixelart devo 
riprendere a disegnare. 
Per ogni pixelart ho una card che mostra anteprima, nome, dimensione pixel logico e dimensione matrice e ci clicco sopra

L'anteprima la salvo ogni tot minuti a livello locale con degli snapshot e non è necessario salvarla in realtime.
Ovviamente jpg super compresso.

renderer.extract.canvas(stage).toDataURL('image/jpg', 0.8)
*/

import { Box, Button, Flex, Menu, Portal, Spinner, Text } from "@chakra-ui/react"
import { useAppAuth } from "../../../../contexts/AppAuthContext"
import { useRealtime } from "../../../../contexts/RealtimeContext"
import { PlusCircle } from "lucide-react"
import { MotionButton } from "../../../../utils/objects/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { SERVER_BASE_URL } from "../../../../utils/objects/constants"
import axios, { AxiosError } from "axios"
import { signHttpHeaderWithFirebaseJwtToken } from "../../../../services/firebase/authentication"
import type {
    pixelartsListFromBackend,
    singleElementOf_pixelartsListFromBackend
} from "../../../../utils/types/rooms"
import PixelartCard from '../../cards/Pixelart/Card'

import artsApi from '../../../../api/arts'
import { useCallback, useMemo } from "react"
import { useRoomUI } from "../../../../containers/WorkingRoom/Room"
import { useDeviceDetection } from "../../../../contexts/DeviceDetectorContext"
import { useFriendsContext } from "../../../../contexts/FriendsContext"

type Props = {
    workingLayerId: string,
}

function Scenario({ workingLayerId }: Props) {
    console.log("rendering scenario")
    const { isAuthenticated, secondAuth } = useAppAuth()
    const { workingRoom, client } = useRealtime()
    const { setScenario } = useRoomUI()
    const queryClient = useQueryClient()
    const { friends } = useFriendsContext()

    const { isMobile } = useDeviceDetection()

    if (!(secondAuth.status === 'authenticated')) {
        return null
    }

    const { details: roomData } = workingRoom

    const pixelartsList = useQuery<pixelartsListFromBackend, AxiosError>({
        queryKey: ['pixelartsList', roomData?.data?.roomData.basic[0], workingLayerId],
        enabled: !!(isAuthenticated && workingLayerId && roomData?.data),
        queryFn: async ({ queryKey }) => {
            const headers = {}
            await signHttpHeaderWithFirebaseJwtToken(headers)
            try {
                const response = await axios.get(`${SERVER_BASE_URL}/arts/pixelartsList?workingLayerId=${workingLayerId}`, { headers })
                if ('error' in response.data) { throw new Error(response.data.error) }
                return response.data
            }
            catch (err) { throw new Error(err as any) }
        },
    })

    const addArtManually = (artData: singleElementOf_pixelartsListFromBackend) => {
        queryClient.setQueryData<pixelartsListFromBackend>(
            ['pixelartsList', roomData?.data?.roomData.basic[0], workingLayerId],
            (oldData: any) => {
                if (!oldData) {
                    //void cache -> have to initialize the structure
                    return { pixelarts: [artData] }
                }

                return {
                    ...oldData,
                    pixelarts: [artData, ...oldData.pixelarts]
                }
            }
        )
    }

    const handleCreatePixelart = useCallback(async () => {
        const newArtParams = {
            wLayerID: workingLayerId,
            name: `Pixelart-${Math.floor(Math.random() * (3664799 - 1024 + 1)) + 1024}`,
            scale: 4,
            width: 48,
            height: 36
        }

        const response = await artsApi.createNewArt(newArtParams)

        if ('networkError' in response) {
            return
        }

        if ('error' in response.data) {
            return
        }

        const { createdAt, artId } = response.data
        const { name, height, scale, width } = newArtParams

        addArtManually({ artId, name, width, height, logicPixelSize: scale })
    }, [workingRoom.workingLayer.get])

    const createPixelartBtn = useMemo(() => {
        return (
            <MotionButton rounded={'xl'} bgColor={'var(--color-sakura-deep)'}
                whileHover={{ backgroundColor: 'var(--color-sakura-candy)', color: '#fff', }}
                whileTap={{ backgroundColor: 'var(--color-sakura-deep)', filter: 'brightness(1.2)' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => { handleCreatePixelart() }}
            >
                <PlusCircle /> Crea Pixelart
            </MotionButton>
        )
    }, [workingRoom.workingLayer.get])

    const layerOwnerInfo = useMemo(() => {
        const owner = roomData?.data?.roomData.members.find(m => m[2].wLayerId === workingLayerId);
        return {
            owner,
            isMyLayer: owner?.[0] === secondAuth.user.userId
        };
    }, [roomData?.data?.roomData.members, workingLayerId, secondAuth.user.userId])

    const headerBox = useMemo(() => {
        if (!layerOwnerInfo.owner) return null;

        return (
            <Flex {...(isMobile ? { direction: 'column', gap: 4, alignItems: 'center' } : null)}>
                <Box flex={1} overflow={'hidden'} textAlign={isMobile ? 'center' : 'left'}>
                    <Text fontSize={'2xl'} fontWeight={'bold'} color={'var(--color-sakura-deep)'} truncate textOverflow={'ellipsis'}>
                        {layerOwnerInfo.isMyLayer ? 'Il tuo piano di lavoro' : `Piano di lavoro di ${layerOwnerInfo.owner[1]}`}
                    </Text>
                    <Box fontSize={'sm'} color={'var(--color-wood2)'} paddingLeft={2}>
                        <Text> - Seleziona una pixel art per iniziare a disegnare.</Text>
                        <Text> - <b>Vuoi vedere cosa stanno facendo gli altri?</b> Apri "Membri stanza" e scegli il piano di lavoro di un collega.</Text>
                    </Box>
                </Box>
                <Flex flex={0.5} alignItems={'flex-start'} justifyContent={'flex-end'}>
                    {layerOwnerInfo.isMyLayer && createPixelartBtn}
                </Flex>
            </Flex>
        );
    }, [layerOwnerInfo, createPixelartBtn]);

    if (
        (!(isAuthenticated))
        || (!(secondAuth.status === 'authenticated'))
        || (!workingLayerId)
        || (!(client && client.connection.id))
    ) {
        return null
    }
    
    return <Flex direction={'column'} flex={1} p={10} gap={10} bgColor={'var(--color-cream)'} overflow={'auto'}>
        {headerBox}
        <Flex flex={1} flexWrap={'wrap'} gap={isMobile ? 4 : 8} direction={isMobile ? 'column' : 'row'} justifyContent={'center'} alignItems={pixelartsList.isLoading ? 'center' : 'flex-start'}>
            {
                pixelartsList.error ?
                    'download error' :
                    pixelartsList.isLoading ?
                        <Spinner color={'magenta'} size={'xl'} /> :
                        pixelartsList.data?.pixelarts.map(p => (
                            <PixelartCard key={p.artId} artData={p} isMine={layerOwnerInfo.isMyLayer}
                                onArtSelection={(artId) => {
                                    setScenario(['pixelart', artId])
                                }}
                            />
                        ))
            }
        </Flex>
    </Flex>
}

export default Scenario
