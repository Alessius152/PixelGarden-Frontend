
const appRoutes = {
    ROOT: '/',
    FIRST_AUTH: '/firstAuth',
    SECOND_AUTH: '/secondAuth',
    HOMEPAGE: {
        ROOT: '/homepage',
        SECTIONS: {
            FRIENDS: 'friends',
            ROOMS: 'rooms',
            PROFILE: 'profile',
            ROOM_DETAIL: 'rooms/:roomId'
        },
        // Utility per i link (path assoluti)
        get FRIENDS() { return `${this.ROOT}/${this.SECTIONS.FRIENDS}` },
        get ROOMS() { return `${this.ROOT}/${this.SECTIONS.ROOMS}` },
        get PROFILE() { return `${this.ROOT}/${this.SECTIONS.PROFILE}` },
    },
    WORKING_ROOM: '/workingRoom'
}

const realtimeHomepageNotificationKeys = {
    RECEIVED_NEW_FRIENDSHIP_REQUEST: 'friendship-request-received',
    RECEIVED_FRIENDSHIP_REQUEST_CANNOT_BE_CONSUMED: 'received-friendship-request-cannot-be-consumed',
    FRIEND_HAS_CANCELED_FRIENDSHIP_BETWEEN_YOU: 'friend-has-canceled-relation-betw-you',

    RECEIVED_NEW_ROOM_JOIN_INVITE: 'received-new-room-join-invite',
}


export {
    appRoutes,
    realtimeHomepageNotificationKeys,
}
