
type notification_newArtCreated = {
    headers: {
        rtClientId: string,
        userAt: string,
    },
    roomId: string,
    workingLayerId: string,
    artData: {
        artId: string,
        name: string,
        width: number,
        height: number,
        logicPixelSize: number,
    },
    createdAt: string
}

type notification_newArtLayerCreated = {
    headers: {
        rtClientId: string,
        userAt: string,
    },
    artId: string,
    layerData: {
        dim: [number,number]/*0 = width, 1 = height*/,
        name: string,
        uuid: string,
        orderIndex: number,
        owner: [string, string]
    }
}

type notification_newCollabsAdded = {
    headers: {
        rtClientId: string,
        userAt: string,
    },
    artId: string,
    collaborators: Array<[string, string]>
}

type notification_newStrokeBeenApproved = {
    headers: [string, string],
    layerId: string
    square: [number, number, number, number],
    pixels: string
}

export type {
    notification_newArtCreated,
    notification_newArtLayerCreated,
    notification_newCollabsAdded,
    notification_newStrokeBeenApproved,
}
