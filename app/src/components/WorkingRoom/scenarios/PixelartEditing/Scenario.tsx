import { Box, Button, Flex, Skeleton, Spinner, Text } from "@chakra-ui/react"
import { useDeviceDetection } from "../../../../contexts/DeviceDetectorContext"

import ToolsSidebar from "../../ToolsBar/Sidebar"
import LayerTreeSidebar from "../../LayerTreeSidebar/Sidebar"
import { DragScrollContainer } from "../../../utils/DragScrollContainer"
import { useRealtime } from "../../../../contexts/RealtimeContext"
import { useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { MotionBox, MotionFlex } from "../../../../utils/objects/ui"
import {
    centerVariants_pixelartEditingScenario,
    containerVariants_pixelartEditingScenario,
    rightSideVariants_pixelartEditingScenario,
    sideElementVariants_pixelartEditingScenario
} from "../../../../utils/objects/ui/objects"
import { useRoomUI } from "../../../../containers/WorkingRoom/Room"
import type { AxiosError } from "axios"
import { signHttpHeaderWithFirebaseJwtToken } from "../../../../services/firebase/authentication"
import axios from "axios"
import { SERVER_BASE_URL } from "../../../../utils/objects/constants"
import { useAppAuth } from "../../../../contexts/AppAuthContext"
import { useParams } from "react-router-dom"
import PixelartTile from "./components/PixelartTile/Tile"
import { CanvasCacheProvider, } from "../../../../contexts/CanvasSyncContext"
import { useMemo } from "react"
import type { artMetadataFromBackend } from "../../../../utils/types/arts"
import SavePixelartBtn from "../../buttons/SavePixelartBtn"
import { useArtEditingContext } from "../../../../contexts/PixelartEditingContext"
import { GLOBAL_nativeTextureCache } from "../../../../utils/functions/drawing"

function Scenario() {
    const { isMobile } = useDeviceDetection()
    const { workingRoom } = useRealtime()
    const { isAuthenticated } = useAppAuth()
    const { scenario } = useRoomUI()
    const { selectedLayerId, getCurrentArtLayersEditingToken } = useArtEditingContext()

    const [_0, artId] = scenario
    const { roomId } = useParams()

    if (
        (scenario[0] === 'unidentified') ||
        (!(scenario[0] === 'pixelart')) ||
        (!workingRoom.details?.data) ||
        (!roomId)
    ) {
        return null
    }

    const artData = useQuery<artMetadataFromBackend, AxiosError>({
        queryKey: ['pixelartMetadata', artId],
        enabled: !!(isAuthenticated && artId),
        queryFn: async () => {
            const headers = {}
            await signHttpHeaderWithFirebaseJwtToken(headers)
            try {
                const response = await axios.get(`${SERVER_BASE_URL}/arts/getPixelartData?artId=${artId}`, { headers })
                if ('error' in response.data) { throw new Error(response.data.error) }
                return response.data
            }
            catch (err) { throw new Error(err as any) }
        },
        staleTime: Infinity
    })

    const sharedOffscreenCanvas = useMemo(() => {
        if (!artData.data) return
        return new OffscreenCanvas(artData.data?.metadata.width, artData.data?.metadata.height)
    }, [artData.data?.metadata?.width, artData.data?.metadata?.height])

    const toolsSidebar = <ToolsSidebar />

    // Estrazione e memoizzazione delle sole proprietà primitive necessarie
    const syncMetadata = useMemo(() => {
        return {
            width: artData.data?.metadata?.width,
            height: artData.data?.metadata?.height,
            logicPixelSize: artData.data?.metadata.logicPixelSize,
            token: workingRoom.details?.data?.roomData.layersDownloadingToken
        }
    }, [artData.data?.metadata?.width, artData.data?.metadata?.height, workingRoom.details?.data?.roomData.layersDownloadingToken])

    const handleSaveLayer = async ([uuid, ownerAt]: [string, string]) => {
        const url = `https://pixelartists-collaborative-app.stiglianialessio567.workers.dev/editArtLayer?layerId=${uuid}`
        const editingToken = getCurrentArtLayersEditingToken()

        if (!(editingToken && sharedOffscreenCanvas)) {
            return
        }

        const layerSnapshot = GLOBAL_nativeTextureCache[uuid]

        if (!layerSnapshot) {
            return
        }

        try {
            const ctx = sharedOffscreenCanvas.getContext('2d')
            if (!ctx) return

            // CRUCIALE: Puliamo e disegniamo i pixel correnti prima della compressione
            ctx.clearRect(0, 0, sharedOffscreenCanvas.width, sharedOffscreenCanvas.height)
            ctx.drawImage(layerSnapshot, 0, 0)

            const pngBlob = await sharedOffscreenCanvas.convertToBlob({
                type: 'image/png'
            })

            if (!pngBlob) {
                console.error("Impossibile convertire il layer in PNG")
                return
            }

            await axios.post(url, pngBlob, {
                headers: {
                    'Authorization': `Bearer ${editingToken}`,
                    'Content-Type': 'image/png'
                }
            })
        }
        catch (err) {
            //errore di rete
        }
    }

    return (
        <MotionFlex flex={1} overflow={'hidden'} initial="hidden" animate="visible" variants={containerVariants_pixelartEditingScenario}>
            {isMobile ? (
                <Flex direction={'column'} flex={1}>
                    <Box flex={1} bgColor={'var(--color-cream)'} />
                    {toolsSidebar}
                </Flex>
            ) : (
                <>
                    <MotionBox variants={sideElementVariants_pixelartEditingScenario}>
                        {toolsSidebar}
                    </MotionBox>
                    {!artData.isLoading && artData.data ? (
                        <CanvasCacheProvider artData={artData}>
                            <MotionFlex flex={1} direction={'column'} overflow={'hidden'} variants={centerVariants_pixelartEditingScenario}>
                                <Box textAlign={'center'} p={1} bgColor={'#ffceeca9'} fontSize={'sm'} fontWeight="medium">
                                    <Flex as={'span'} alignItems={'center'} justifyContent={'space-between'}>
                                        <Flex alignItems={'center'} gap={2}>
                                            <Text as={'span'}>{artData.data?.metadata?.name}</Text>
                                            <Text as={'span'} color={'gray'} fontSize={'2xs'}>
                                                {syncMetadata.width}x{syncMetadata.height}x{syncMetadata.logicPixelSize}
                                            </Text>
                                        </Flex>
                                        {(scenario[0] === 'pixelart') && (
                                            <SavePixelartBtn onClick={() => {
                                                const currLayer = selectedLayerId
                                                if (!currLayer) return
                                                handleSaveLayer(currLayer)
                                            }} />
                                        )}
                                    </Flex>
                                </Box>

                                <Box flex={1} bgColor={'var(--color-cream)'} overflow={'auto'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                    <DragScrollContainer props={{ whiteSpace: 'nowrap', overflow: 'hidden', flex: 1 }}>
                                        <PixelartTile artData={artData} />
                                    </DragScrollContainer>
                                </Box>
                            </MotionFlex>

                            <MotionBox variants={rightSideVariants_pixelartEditingScenario}>
                                <LayerTreeSidebar artData={artData} />
                            </MotionBox>
                        </CanvasCacheProvider>
                    ) : (
                        <Flex flex={1} direction={'column'} alignItems={'center'} justifyContent={'center'} bgColor={'var(--color-cream)'} gap={4}>
                            {artData.error ? (
                                <Text>Errore durante il caricamento dei metadati.</Text>
                            ) : (
                                <>
                                    <Spinner color='var(--color-sakura-deep)' size='xl' borderWidth={4} />
                                    <Text color={'salmon'}>Inizializzazione spazio di lavoro...</Text>
                                </>
                            )}
                        </Flex>
                    )}
                </>
            )}
        </MotionFlex>
    )
}

export default Scenario