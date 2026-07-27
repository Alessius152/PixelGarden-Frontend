type artCreationDataFE = {
    wLayerID: string,
    name: string,
    width: number,
    height: number,
    scale: number
}

//i dati che il backend si aspetta nel body
type artCreationDataBE = {
    workingLayerId: string,
    artData: {
        name: string,
        logicPixelSize: number,
        width: number,
        height: number
    },
}

/*qui il primo elemento è lo userId e il secondo è lo username*/
type singleElementOf_pixelartCollaboratorsFromBackend = [string, string]
type pixelartCollaboratorsListFromBackend = {
    collaborators: Array<singleElementOf_pixelartCollaboratorsFromBackend>,
}

type newLayerAddingFE = {
    artId: string,
    layerName: string,
    artLayersEditingToken: string
}
type newLayerAddingBE = {
    artId: string,
    layerName: string,
    artLayersEditingToken: string
}

interface ArtLayersResponse {
    layers: Array<ArtLayer>,
    hasMore: boolean,
    nextCursor: number | null,
    layersEditingToken: string | null,
}
//metadata: uuid, name, orderIndex,
//owner: username, userId
interface ArtLayer {
    metadata: [string, string, number],
    owner: [string, string]
}

type addCollabsFE = {
    artId: string,
    membershipsId: Array<string>
}
type addCollabsBE = {
    artId: string,
    commit: Array<string>
}

type artMetadataFromBackend = {
    artId: string, // uuidv7
    metadata: { name: string, width: number, height: number, logicPixelSize: number },
    artOwner: [string] /*0 = userId*/
}

type approveStrokeBE = {
    editingToken: string,
    layerId: string,
    x: number,
    y: number,
    w: number,
    h: number,
    pixels: Array<number>
}

export type {
    artCreationDataFE,
    artCreationDataBE,
    singleElementOf_pixelartCollaboratorsFromBackend,
    pixelartCollaboratorsListFromBackend,
    newLayerAddingFE,
    newLayerAddingBE,
    ArtLayersResponse,
    ArtLayer,
    addCollabsFE,
    addCollabsBE,
    artMetadataFromBackend,
    approveStrokeBE,
}