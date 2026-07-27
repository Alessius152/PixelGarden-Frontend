type friendData = {
    username: string,
    userId: string,
    isOnline: boolean,
}
type friendDataFromBackend = {
    relationId: string,
    friend: string,
    friendId: string,
    isOnline: boolean,
}
type friendCardAction = 'delete'
type friendsListCursorType = { cursor1: string, cursor2: string }
type sentFriendshipRequestFromBackend = {
    requestId: string,
    receiver: string,
    receiverId: string
}
type receivedFriendshipRequestFromBackend = {
    requestId: string,
    sender: string,
    senderId: string,
}
type FriendshipRequestAnswer = 0 | 1

export type {
    FriendshipRequestAnswer,
    friendCardAction,
    friendData,
    friendDataFromBackend,
    friendsListCursorType,
    receivedFriendshipRequestFromBackend,
    sentFriendshipRequestFromBackend,
}