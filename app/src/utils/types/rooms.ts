
type privateRoomData = {
    roomId: string,
    name: string,
    description: string | null,
    members: {
        total: number,
        activeNow: number,
    }
}
type roomCreationData = {
    roomData: {
        name: string,
        description: string | null
    }
}
type apiCursor = {
    cursor1: string,
    cursor2: string,
}
type apiResponse_roomsList = {
    result: Array<privateRoomData>,
    nextCursor: apiCursor,
    isTheLastPage: boolean,
}

type receivedJoiningInvite = {
    inviteId: string,
    inviterUname: string,
    inviterUserId: string,
    name: string,
    createdAt: string
}
type apiResponse_receivedJoiningInvites = {
    result: Array<receivedJoiningInvite>,
    nextCursor: string,
    isTheLastPage: boolean,
    totalRecords: number
}

type sentJoiningInvite = {
    inviteId: string,
    createdAt: string,
    invitee: string,
    room: string,
}
type apiResponse_sentJoiningInvites = {
    result: Array<sentJoiningInvite>,
    nextCursor: string,
    isTheLastPage: boolean,
    totalRecords: number
}

/*api /rooms/roomDetails per caricare la UI della working room
i details roomData.basic sono [uuid, name, description]
*/
type roomMember_fromRoomDetailsFromBackend = [string, string, { mId: string, wLayerId: string }]
type roomDetailsFromBackend = {
    roomData: {
        basic: [string, string, string],
        layersDownloadingToken: string,
        members: Array<roomMember_fromRoomDetailsFromBackend>,
    },
}

type singleElementOf_pixelartsListFromBackend = { artId: string, name: string, width: number, height: number, logicPixelSize: number }
type pixelartsListFromBackend = {
    pixelarts: Array<singleElementOf_pixelartsListFromBackend>,
}

type WorkingRoomScenario = Array<string>

export type {
    privateRoomData,
    roomCreationData,
    apiCursor,
    apiResponse_roomsList,
    receivedJoiningInvite,
    apiResponse_receivedJoiningInvites,
    sentJoiningInvite,
    apiResponse_sentJoiningInvites,
    roomMember_fromRoomDetailsFromBackend,
    roomDetailsFromBackend,
    singleElementOf_pixelartsListFromBackend,
    pixelartsListFromBackend,
    WorkingRoomScenario,
}
