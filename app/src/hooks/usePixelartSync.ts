import { useEffect } from 'react'
import pako from 'pako'
import { useCanvasCache } from '../contexts/CanvasSyncContext'
import type { InboundMessage } from 'ably'
import type { notification_newStrokeBeenApproved } from '../utils/types/realtime/notifications/arts'
import { useRealtime } from '../contexts/RealtimeContext'
import { useAppAuth } from '../contexts/AppAuthContext'

interface UsePixelartSyncProps {
    ablyClient: any
    roomId: string
    artId: string
}

const base64ToUint8Array = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function usePixelartSync({ ablyClient, roomId, artId }: UsePixelartSyncProps) {
    const { updateTextureInRam, getTextureNative } = useCanvasCache()
    const { workingRoom } = useRealtime()
    const { secondAuth } = useAppAuth()

    useEffect(() => {
        if (!ablyClient || !roomId || !artId || !workingRoom.channel || secondAuth.status !== 'authenticated') {
            return
        }

        const handleRemoteStroke = async (msg: InboundMessage) => {
            const {
                headers: [rtClientId, senderUserId],
                layerId,
                square: [w, h, x, y],
                pixels: compressedPixelsBase64
            } = msg.data as notification_newStrokeBeenApproved

            if (rtClientId === secondAuth.user.uuid) return

            const currentBitmap = getTextureNative(layerId)
            if (!currentBitmap) return

            const dataToInflate = base64ToUint8Array(compressedPixelsBase64)
            const pixels = pako.inflate(dataToInflate)

            const canvas = document.createElement('canvas')
            canvas.width = currentBitmap.width
            canvas.height = currentBitmap.height
            const ctx = canvas.getContext('2d', { alpha: true })

            if (ctx) {
                ctx.drawImage(currentBitmap, 0, 0)
                const rectData = new ImageData(new Uint8ClampedArray(pixels), w, h)
                ctx.putImageData(rectData, x, y)
                const newBitmap = await createImageBitmap(canvas)
                updateTextureInRam(layerId, newBitmap)
                canvas.width = 0
                canvas.height = 0
            }
        }

        workingRoom.channel.subscribe(`new-stroke-approved-${roomId}-${artId}`, handleRemoteStroke)


        return () => {
            workingRoom.channel?.unsubscribe(`new-stroke-approved-${roomId}-${artId}`, handleRemoteStroke)
        }
    }, [ablyClient, roomId, artId, workingRoom.channel])
}