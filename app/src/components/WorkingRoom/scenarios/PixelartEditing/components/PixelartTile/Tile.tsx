import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useArtEditingContext } from '../../../../../../contexts/PixelartEditingContext'
import { useCanvasCache, canvasEvents } from '../../../../../../contexts/CanvasSyncContext'
import { DrawingTool } from '../../../../../../utils/enums/artEditing'
import type { UseQueryResult } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { approveStrokeBE, artMetadataFromBackend } from '../../../../../../utils/types/arts'
import { useAppAuth } from '../../../../../../contexts/AppAuthContext'
import axios from 'axios'
import { SERVER_BASE_URL } from '../../../../../../utils/objects/constants'
import { signHttpHeaderWithFirebaseJwtToken } from '../../../../../../services/firebase/authentication'
import { usePixelartSync } from '../../../../../../hooks/usePixelartSync'
import { useRealtime } from '../../../../../../contexts/RealtimeContext'
import { useRoomUI } from '../../../../../../containers/WorkingRoom/Room'
import { useParams } from 'react-router-dom'
import pako, { type Data } from 'pako'

type Props = {
    artData: UseQueryResult<artMetadataFromBackend, AxiosError<unknown, any>>;
};

function PixelartTile({ artData }: Props) {
    const { artLayersQuery, selectedLayerId, currColor, currTool, getCurrentArtLayersEditingToken } = useArtEditingContext()
    const { updateTextureInRam, getTextureNative } = useCanvasCache()
    const { secondAuth } = useAppAuth()
    const { client } = useRealtime()
    const { scenario } = useRoomUI()
    const { roomId, pixelartId } = useParams()

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null)
    const currentCursorRef = useRef<{ x: number; y: number } | null>(null)

    const bgCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const activeLayerCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const bboxRef = useRef<{ minX: number; minY: number; maxX: number; maxY: number }>({
        minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity
    })

    const width = artData.data!.metadata.width
    const height = artData.data!.metadata.height
    const logicalPixelSize = artData.data!.metadata.logicPixelSize

    const [isDrawing, setIsDrawing] = useState<boolean>(false)
    const [isPanning, setIsPanning] = useState<boolean>(false)
    const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [scrollStart, setScrollStart] = useState<{ left: number; top: number }>({ left: 0, top: 0 })

    if ((scenario[0] !== 'pixelart') && roomId && pixelartId) {
        return null
    }

    usePixelartSync({ 
        ablyClient: client,
        roomId: roomId || '',
        artId: pixelartId || ''
    })

    const isPanMode = currTool.get === DrawingTool.PAN

    const layersToRender = useMemo(() => {
        const pages = artLayersQuery.data?.pages
        if (!pages) return []

        const allLayers = []
        for (let i = 0; i < pages.length; i++) {
            const pLayers = pages[i].layers
            for (let j = 0; j < pLayers.length; j++) {
                allLayers.push(pLayers[j])
            }
        }

        let maxOrderIndex = Infinity
        if (selectedLayerId) {
            const selectedLayer = allLayers.find(l => l.metadata[0] === selectedLayerId[0])
            if (selectedLayer) {
                maxOrderIndex = selectedLayer.metadata[2]
            }
        }

        return allLayers
            .filter(layer => layer.metadata[2] <= maxOrderIndex)
            .sort((a, b) => a.metadata[2] - b.metadata[2])
    }, [artLayersQuery.data, selectedLayerId])

    if (!bgCanvasRef.current) {
        bgCanvasRef.current = document.createElement('canvas')
        bgCanvasRef.current.width = width
        bgCanvasRef.current.height = height
    }
    if (!activeLayerCanvasRef.current) {
        activeLayerCanvasRef.current = document.createElement('canvas')
        activeLayerCanvasRef.current.width = width
        activeLayerCanvasRef.current.height = height
    }

    const repaintCanvas = useCallback(() => {
        const mainCanvas = canvasRef.current
        if (!mainCanvas) return
        const mainCtx = mainCanvas.getContext('2d')
        if (!mainCtx) return

        mainCtx.imageSmoothingEnabled = false

        if (isDrawing && selectedLayerId) {
            mainCtx.clearRect(0, 0, width, height)
            mainCtx.drawImage(bgCanvasRef.current!, 0, 0)
            mainCtx.drawImage(activeLayerCanvasRef.current!, 0, 0)
        } else {
            mainCtx.clearRect(0, 0, width, height)
            for (let i = 0; i < layersToRender.length; i++) {
                const uuid = layersToRender[i].metadata[0]
                const imgBitmap = getTextureNative(uuid)
                if (imgBitmap) {
                    mainCtx.drawImage(imgBitmap, 0, 0)
                }
            }
        }

        const cursor = currentCursorRef.current
        if (cursor && selectedLayerId && !isPanMode) {
            mainCtx.save()
            if (currTool.get === DrawingTool.ERASER) {
                mainCtx.fillStyle = 'rgba(255, 0, 0, 0.4)'
            } else {
                const [_, hexColor] = currColor.get
                mainCtx.fillStyle = `${hexColor}aa`
            }
            mainCtx.fillRect(cursor.x, cursor.y, 1, 1)
            mainCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
            mainCtx.lineWidth = 1
            mainCtx.strokeRect(cursor.x, cursor.y, 1, 1)
            mainCtx.restore()
        }
    }, [isDrawing, selectedLayerId, layersToRender, width, height, isPanMode, currColor, currTool, getTextureNative])

    useEffect(() => {
        repaintCanvas()
    }, [repaintCanvas])

    useEffect(() => {
        const handleTextureUpdate = () => {
            repaintCanvas()
        }
        canvasEvents.addEventListener('texture_updated', handleTextureUpdate)
        return () => {
            canvasEvents.removeEventListener('texture_updated', handleTextureUpdate)
        }
    }, [repaintCanvas])

    const drawContinuousLine = (x1: number, y1: number, x2: number, y2: number) => {
        const tStart = performance.now();

        const actCtx = activeLayerCanvasRef.current?.getContext('2d')
        if (!actCtx || !selectedLayerId) return

        const isEraser = currTool.get === DrawingTool.ERASER
        if (!isEraser) {
            const [_, hexColor] = currColor.get
            actCtx.fillStyle = hexColor
        }

        const dx = Math.abs(x2 - x1)
        const dy = Math.abs(y2 - y1)
        const sx = x1 < x2 ? 1 : -1
        const sy = y1 < y2 ? 1 : -1
        let err = dx - dy

        let currX = x1
        let currY = y1

        const bbox = bboxRef.current

        while (true) {
            if (isEraser) {
                actCtx.clearRect(currX, currY, 1, 1)
            } else {
                actCtx.fillRect(currX, currY, 1, 1)
            }

            if (currX < bbox.minX) bbox.minX = currX
            if (currX > bbox.maxX) bbox.maxX = currX
            if (currY < bbox.minY) bbox.minY = currY
            if (currY > bbox.maxY) bbox.maxY = currY

            if (currX === x2 && currY === y2) break
            const e2 = 2 * err
            if (e2 > -dy) { err -= dy; currX += sx }
            if (e2 < dx) { err += dx; currY += sy }
        }

        const tEnd = performance.now();
        console.log(`%c[CPU Line] Tracciati pixel tra (${x1},${y1}) e (${x2},${y2}) in ${(tEnd - tStart).toFixed(2)}ms`, "color: #4CAF50;");
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanMode) {
            const container = containerRef.current
            if (container) {
                setIsPanning(true)
                setPanStart({ x: e.clientX, y: e.clientY })
                setScrollStart({ left: container.scrollLeft, top: container.scrollTop })
            }
            return
        }

        const cursor = currentCursorRef.current
        if (!selectedLayerId || !cursor) return
        e.preventDefault()

        const bgCtx = bgCanvasRef.current!.getContext('2d')!
        const actCtx = activeLayerCanvasRef.current!.getContext('2d')!

        bgCtx.clearRect(0, 0, width, height)
        actCtx.clearRect(0, 0, width, height)

        bboxRef.current = { minX: cursor.x, minY: cursor.y, maxX: cursor.x, maxY: cursor.y }

        for (let i = 0; i < layersToRender.length; i++) {
            const uuid = layersToRender[i].metadata[0]
            const imgBitmap = getTextureNative(uuid)
            if (!imgBitmap) continue

            if (uuid === selectedLayerId[0]) {
                actCtx.drawImage(imgBitmap, 0, 0)
            } else {
                bgCtx.drawImage(imgBitmap, 0, 0)
            }
        }

        setIsDrawing(true)
        lastDrawPointRef.current = { x: cursor.x, y: cursor.y }
        drawContinuousLine(cursor.x, cursor.y, cursor.x, cursor.y)
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        if (isPanMode) {
            if (isPanning) {
                const deltaX = e.clientX - panStart.x
                const deltaY = e.clientY - panStart.y
                container.scrollLeft = scrollStart.left - deltaX
                container.scrollTop = scrollStart.top - deltaY
            }
            return
        }

        const rect = canvas.getBoundingClientRect()
        const pixelX = Math.floor((e.clientX - rect.left) / (rect.width / width))
        const pixelY = Math.floor((e.clientY - rect.top) / (rect.height / height))

        if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
            const oldCursor = currentCursorRef.current

            if (!oldCursor || oldCursor.x !== pixelX || oldCursor.y !== pixelY) {
                currentCursorRef.current = { x: pixelX, y: pixelY }

                if (isDrawing && lastDrawPointRef.current) {
                    drawContinuousLine(lastDrawPointRef.current.x, lastDrawPointRef.current.y, pixelX, pixelY)
                    lastDrawPointRef.current = { x: pixelX, y: pixelY }
                }

                repaintCanvas()
            }
        }
    }

    const handleMouseUpOrLeave = async () => {
        if (isDrawing && selectedLayerId && activeLayerCanvasRef.current) {
            setIsDrawing(false)
            lastDrawPointRef.current = null

            const finalBitmap = await createImageBitmap(activeLayerCanvasRef.current)
            updateTextureInRam(selectedLayerId[0], finalBitmap)

            const bbox = bboxRef.current
            if (bbox.minX !== Infinity) {
                const x = Math.max(0, bbox.minX)
                const y = Math.max(0, bbox.minY)
                const w = Math.min(width - x, (bbox.maxX - bbox.minX) + 1)
                const h = Math.min(height - y, (bbox.maxY - bbox.minY) + 1)

                const actCtx = activeLayerCanvasRef.current.getContext('2d', { willReadFrequently: true })
                if (actCtx && w > 0 && h > 0) {
                    const partialImageData = actCtx.getImageData(x, y, w, h)
                    const compressedPixels = pako.deflate(new Uint8Array(
                        partialImageData.data.buffer,
                        partialImageData.data.byteOffset,
                        partialImageData.data.byteLength
                    ))
                    const url = `${SERVER_BASE_URL}/arts/approveStroke`
                    const token = await getCurrentArtLayersEditingToken()

                    if (!token) return
                    const headers = {
                        'Content-Type': 'application/octet-stream',
                        'Content-Encoding': 'deflate',
                        'x-editing-token': token,
                        'x-layer-id': selectedLayerId[0],
                        'x-pos-x': x.toString(),
                        'x-pos-y': y.toString(),
                        'x-width': w.toString(),
                        'x-height': h.toString()
                    }
                    await signHttpHeaderWithFirebaseJwtToken(headers)
                    try {
                        const response = await axios.post(url, compressedPixels, { headers })
                    }
                    catch (err) {
                        //errore di rete
                    }
                }
            }
        }

        setIsDrawing(false)
        setIsPanning(false)
        lastDrawPointRef.current = null
        currentCursorRef.current = null
        repaintCanvas()
    }

    const getCursorStyle = () => {
        if (!selectedLayerId) return 'default'
        if (isPanMode) return isPanning ? 'grabbing' : 'grab'
        return 'none'
    }

    if (!selectedLayerId) return <></>
    if (!(secondAuth.status === 'authenticated')) return <></>

    const isMine = selectedLayerId[1] === secondAuth.user.userId

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'auto', position: 'relative', cursor: getCursorStyle(), userSelect: 'none', scrollbarWidth: 'none' }}>
            <div style={{ width: width * logicalPixelSize, height: height * logicalPixelSize, border: '1px solid black', imageRendering: 'pixelated', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <canvas ref={canvasRef} width={width} height={height}
                    style={{
                        width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent',
                        pointerEvents: isMine ? 'auto' : 'none'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                />
            </div>
        </div>
    )
}

export default React.memo(PixelartTile)