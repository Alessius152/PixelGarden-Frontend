import React, { createContext, useContext, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { UseQueryResult } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { artMetadataFromBackend } from '../utils/types/arts'
import { useArtEditingContext } from './PixelartEditingContext'
import { useRealtime } from './RealtimeContext'
import {
    createEmptyTransparentBitmap,
    GLOBAL_downloadQueue,
    GLOBAL_nativeTextureCache,
    GLOBAL_syncedPages,
    GLOBAL_trackedLayerIds,
    parsePngToLayer
} from '../utils/functions/drawing'

interface CanvasCacheContextType {
    registerLocallyCreatedLayer: (layerId: string, bitmap: ImageBitmap) => void
    updateTextureInRam: (layerUuid: string, newBitmap: ImageBitmap) => void
    getTextureNative: (layerId: string) => ImageBitmap | undefined
}

const CanvasCacheContext = createContext<CanvasCacheContextType | undefined>(undefined)

export const useCanvasCache = () => {
    const context = useContext(CanvasCacheContext)
    if (!context) throw new Error("useCanvasCache must be called from a component that's placed into CanvasCacheProvider")
    return context
}

export const canvasEvents = new EventTarget()

type ProviderProps = {
    children: React.ReactNode
    artData: UseQueryResult<artMetadataFromBackend, AxiosError>
}

export function CanvasCacheProvider({ children, artData }: ProviderProps) {
    const { artLayersQuery } = useArtEditingContext()
    const { workingRoom } = useRealtime()

    const token = workingRoom.details?.data?.roomData.layersDownloadingToken

    const getTextureNative = useCallback((layerId: string) => {
        return GLOBAL_nativeTextureCache[layerId]
    }, [])

    const updateTextureInRam = useCallback((layerUuid: string, newBitmap: ImageBitmap) => {
        const oldBitmap = GLOBAL_nativeTextureCache[layerUuid]
        if (oldBitmap && oldBitmap !== newBitmap) {
            oldBitmap.close()
        }
        GLOBAL_nativeTextureCache[layerUuid] = newBitmap
        canvasEvents.dispatchEvent(new CustomEvent('texture_updated', { detail: { layerId: layerUuid } }))
    }, [])

    const registerLocallyCreatedLayer = useCallback((layerId: string, bitmap: ImageBitmap) => {
        GLOBAL_trackedLayerIds.add(layerId)

        const oldBitmap = GLOBAL_nativeTextureCache[layerId]
        if (oldBitmap && oldBitmap !== bitmap) {
            oldBitmap.close()
        }

        GLOBAL_nativeTextureCache[layerId] = bitmap
        canvasEvents.dispatchEvent(new CustomEvent('texture_updated', { detail: { layerId } }))
    }, [])

    const downloadLayerWorker = async (layerId: string, userId: string) => {
        try {
            if (GLOBAL_nativeTextureCache[layerId] || !artData.data) return

            const url = `https://pixelartists-collaborative-app.stiglianialessio567.workers.dev/downloadArtLayer?artId=${artData.data.artId}&layerId=${layerId}&userId=${userId}`

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })

            if (response.status === 404) {
                const fallbackLayer = await createEmptyTransparentBitmap(artData.data.metadata.width, artData.data.metadata.height)
                GLOBAL_nativeTextureCache[layerId] = fallbackLayer
                canvasEvents.dispatchEvent(new CustomEvent('texture_updated', { detail: { layerId } }))
                return
            }

            if (!response.data || response.data.size === 0 || response.data.type.includes('json') || response.data.type.includes('html')) {
                return
            }

            const imgBitmap = await parsePngToLayer(response.data)

            if (GLOBAL_nativeTextureCache[layerId]) {
                imgBitmap.close()
                return
            }

            GLOBAL_nativeTextureCache[layerId] = imgBitmap
            canvasEvents.dispatchEvent(new CustomEvent('texture_updated', { detail: { layerId } }))

        } catch (err) {
            console.error(`[CACHE] Layer ${layerId} non scaricabile o inesistente. Bloccato.`);
        }
    }

    useEffect(() => {
        if (artLayersQuery.isLoading || artLayersQuery.isError || !artLayersQuery.data || !artData.data || !token) {
            return
        }

        const pages = artLayersQuery.data.pages

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {

            if (GLOBAL_syncedPages.has(pageIndex)) {
                continue
            }

            const layersOfNewPage = pages[pageIndex].layers

            for (let j = 0; j < layersOfNewPage.length; j++) {
                const uuid = layersOfNewPage[j].metadata[0]
                const layerOwnerAt = layersOfNewPage[j].owner[1].replace('@', '')

                const hasTexture = !!GLOBAL_nativeTextureCache[uuid]
                const isTracked = GLOBAL_trackedLayerIds.has(uuid)

                if (!hasTexture && !isTracked) {
                    GLOBAL_trackedLayerIds.add(uuid) // Marcatura sincrona immediata per evitare doppie code
                    GLOBAL_downloadQueue.add(() => downloadLayerWorker(uuid, layerOwnerAt))
                }
            }

            GLOBAL_syncedPages.add(pageIndex)
        }

    }, [artLayersQuery.data, artLayersQuery.isLoading, artLayersQuery.isError, token, artData.data])

    return (
        <CanvasCacheContext.Provider value={{ registerLocallyCreatedLayer, updateTextureInRam, getTextureNative }}>
            {children}
        </CanvasCacheContext.Provider>
    )
}