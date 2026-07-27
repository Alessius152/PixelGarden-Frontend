
type notification_newFriendshipRequestNotification = {
    from: {
        username: string,
        userId: string
    },
    requestId: string,
    sentAt: string
}

type notification_receivedAnswerToSentFReq = {
    with: {
        answer: true
    },
    friend: {
        friend: string,
        friendId: string,
        isOnline: false,
        relationId: string,
    },
    request: string
} | {
    with: {
        answer: false
    },
    friend: null,
    request: string
}

type notification_friendHasCanceledFriendshipBetweenYou = {
    who: string,
    relationId: string
}

type notification_receivedNewRoomJoinInvite = {
    from: [string, string],
    inviteId: string,
    roomName: string,
}

export type {
    notification_newFriendshipRequestNotification,
    notification_receivedAnswerToSentFReq,
    notification_friendHasCanceledFriendshipBetweenYou,
    notification_receivedNewRoomJoinInvite,
}
