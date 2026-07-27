import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react"
import { Layers } from "lucide-react"
import { ResizableBox } from "../../utils/ResizableBox"

import artsApi from '../../../api/arts'
import { useRoomUI } from "../../../containers/WorkingRoom/Room"
import { Virtuoso } from "react-virtuoso"
import ArtLayerCard from "../cards/ArtLayer/Card"
import { useAppAuth } from "../../../contexts/AppAuthContext"
import React, { useEffect, useMemo, useState } from "react"
import { useArtEditingContext } from "../../../contexts/PixelartEditingContext"
import { useCanvasCache } from "../../../contexts/CanvasSyncContext"
import { createEmptyTransparentBitmap } from "../../../utils/functions/drawing"
import { useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import type { ArtLayer, ArtLayersResponse, artMetadataFromBackend, pixelartCollaboratorsListFromBackend } from "../../../utils/types/arts"
import type { UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { useIsCollaborator } from "../../../hooks/useIsCollaborator"

const generateCasualLayerName: () => string = () => {
    return ''
}

type Props = {
    artData: UseQueryResult<artMetadataFromBackend, AxiosError<unknown, any>>
}

function Sidebar({ artData }: Props) {
    console.log("la sidebar che riporta il bottone nuovo layer e, ovviamente, i layer.")
    const { scenario: [_0, artId] } = useRoomUI()
    const { secondAuth } = useAppAuth()
    const { artLayersQuery, getCurrentArtLayersEditingToken } = useArtEditingContext()
    const { updateTextureInRam } = useCanvasCache()
    const queryClient = useQueryClient()

    const isCollaborator = useIsCollaborator(artId, (secondAuth as any).user?.userId)

    const allLayers = useMemo(() => {
        const pages = artLayersQuery.data?.pages;
        if (!pages) return [];

        const layers: ArtLayer[] = [];
        for (let i = 0; i < pages.length; i++) {
            const pLayers = pages[i].layers;
            for (let j = 0; j < pLayers.length; j++) {
                layers.push(pLayers[j]);
            }
        }
        return layers.sort((a, b) => b.metadata[2] - a.metadata[2]);
    }, [artLayersQuery.data])

    const handleAddNewLayer = async () => {
        if (!(secondAuth.status === 'authenticated') || !artData.data) return

        const editingToken = getCurrentArtLayersEditingToken()

        if (!editingToken) {
            return
        }

        const response = await artsApi.addNewLayer({ layerName: generateCasualLayerName(), artId, artLayersEditingToken: editingToken })
        if ('networkError' in response || 'error' in response.data) return

        const { newLayersEditingToken, metadata } = response.data
        const { width, height } = artData.data.metadata

        try {
            const transparentBitmap = await createEmptyTransparentBitmap(width, height)
            updateTextureInRam(metadata[0], transparentBitmap)
        } catch (err) {
            console.error("Errore durante la creazione del bitmap trasparente:", err)
        }

        const newLayer: ArtLayer = {
            metadata,
            owner: [secondAuth.user.username, secondAuth.user.userId]
        }

        queryClient.setQueryData<InfiniteData<ArtLayersResponse>>(['artLayersList', artId], (oldData) => {
            if (!oldData) return oldData
            return {
                ...oldData,
                pages: oldData.pages.map((page, index) => {
                    if (index === 0) {
                        return { ...page, layers: [newLayer, ...page.layers], layersEditingToken: newLayersEditingToken }
                    }
                    return page
                })
            }
        })
    }
    
    if ((secondAuth.status !== 'authenticated')) return

    return (
        <ResizableBox initialWidth={340} minWidth={240} maxWidth={600} side="left">
            <Flex direction="column" borderLeft='1px solid var(--color-sakura-base)' gap={2} h="100vh" userSelect="none">
                <Flex alignItems="center" justifyContent="space-between" borderBottom='1px solid var(--color-sakura-base)' p={4}>
                    <Flex alignItems="center" gap={2} flexWrap='wrap'>
                        <Layers color="var(--color-wood)" />
                        <Text fontWeight="bold" color="var(--color-forest-dark)">Albero dei livelli</Text>
                    </Flex>
                    {isCollaborator && <Button size="xs" colorPalette="pink" rounded="md" onClick={handleAddNewLayer}>
                        Nuovo
                    </Button>}
                </Flex>

                <Box flex={1} p={4} overflow="hidden">
                    <Virtuoso
                        style={{ height: '80%', width: '100%' }}
                        data={allLayers}
                        itemContent={(_index, layer) => (
                            <Box mb={2} key={layer.metadata[0]}>
                                <ArtLayerCard layer={layer} />
                            </Box>
                        )}
                    />
                    {artLayersQuery.hasNextPage && (
                        <Flex p={2} justifyContent="center" onClick={() => artLayersQuery.fetchNextPage()}>
                            {artLayersQuery.isFetchingNextPage ? (
                                <Spinner size="sm" />
                            ) : (
                                <Button size="xs" rounded={'md'} variant="solid" colorPalette={'red'}>Carica altri</Button>
                            )}
                        </Flex>
                    )}
                </Box>
            </Flex>
        </ResizableBox>
    )
}

export default Sidebar