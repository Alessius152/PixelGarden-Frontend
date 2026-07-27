import PQueue from "p-queue"

/**
 * Riceve il Blob della PNG e lo converte in un ImageBitmap nativo (VRAM).
 */
export const parsePngToLayer = async (blob: Blob): Promise<ImageBitmap> => {
    // createImageBitmap è un'API nativa del browser velocissima
    return await createImageBitmap(blob)
}

/**
 * Crea un ImageBitmap trasparente al volo delle dimensioni richieste.
 * Operazione sincrona e nativa a impatto zero sulla memoria.
 */
export const createEmptyTransparentBitmap = async (width: number, height: number): Promise<ImageBitmap> => {
    const buffer = new Uint8ClampedArray(width * height * 4)
    const imageData = new ImageData(buffer, width, height)
    return await createImageBitmap(imageData)
}


// =========================================================================
// MEMORIA PERSISTENTE (Fuori dal componente per sopravvivere ai cambi di tab)
// =========================================================================

// Contiene i dati dei pixel decompressi (ImageBitmap) pronti per essere disegnati sul canvas
const GLOBAL_nativeTextureCache: Record<string, ImageBitmap> = {}

// Limita lo scaricamento simultaneo a un massimo di 3 layer alla volta per non intasare la rete
const GLOBAL_downloadQueue = new PQueue({ concurrency: 3 })

// Registra i layer messi in coda o creati localmente per evitare che vengano scaricati due volte
const GLOBAL_trackedLayerIds = new Set<string>() 

// Memorizza gli indici delle pagine di React Query già scansionate per bloccare i refetch sul focus
const GLOBAL_syncedPages = new Set<number>()

export {
    GLOBAL_downloadQueue,GLOBAL_nativeTextureCache,GLOBAL_syncedPages,GLOBAL_trackedLayerIds
}