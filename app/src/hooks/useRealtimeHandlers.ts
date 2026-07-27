import type { InboundMessage, RealtimeChannel } from "ably"
import { useCallback, useEffect, useRef } from "react"
import type {
    notification_newFriendshipRequestNotification,
    notification_receivedAnswerToSentFReq,
    notification_receivedNewRoomJoinInvite
} from "../utils/types/realtime/notifications/friends"
import type {
    friendDataFromBackend,
    receivedFriendshipRequestFromBackend
} from "../utils/types/friends"
import { realtimeHomepageNotificationKeys } from "../utils/objects/objects"
import type { receivedJoiningInvite } from "../utils/types/rooms"

export function useRealtimeHandlers(
    notificationsChannel: RealtimeChannel | undefined,
    handlers: {
        addRecReq: (req: receivedFriendshipRequestFromBackend) => void,
        cancSentReq: (reqId: string) => void,
        addFrManually: (friend: friendDataFromBackend) => void,
        addReceivedRoomJoinInvite: (req: receivedJoiningInvite)=>void
    }
) {

    const handlersRef = useRef(handlers)

    useEffect(() => {
        handlersRef.current = handlers
    }, [handlers])

    const newFriendshipRequestHandler = useCallback((msg: InboundMessage) => {
        const data = msg.data as notification_newFriendshipRequestNotification

        handlersRef.current.addRecReq({
            sender: data.from.username,
            senderId: data.from.userId,
            requestId: data.requestId,
        })
    }, [])

    const sentReqHasBeenConsumedHandler = useCallback((msg: InboundMessage) => {
        const n = msg.data as notification_receivedAnswerToSentFReq

        handlersRef.current.cancSentReq(n.request)

        if (n.with.answer === true) {
            handlersRef.current.addFrManually(n.friend!)
        }
    }, [])

    const receivedNewRoomJoinInviteHandler = useCallback((msg: InboundMessage)=>{
        const {from: [inviterUname, inviterUserId], inviteId,roomName} = msg.data as notification_receivedNewRoomJoinInvite
        handlersRef.current.addReceivedRoomJoinInvite({
            name: roomName,
            inviteId,
            inviterUname,
            inviterUserId,
            createdAt: new Date().toString()
        })
    }, [])

    useEffect(() => {
        if (!notificationsChannel) return

        const setupSubscriptions = () => {
            notificationsChannel.subscribe(realtimeHomepageNotificationKeys.RECEIVED_NEW_FRIENDSHIP_REQUEST, newFriendshipRequestHandler)
            notificationsChannel.subscribe(realtimeHomepageNotificationKeys.RECEIVED_FRIENDSHIP_REQUEST_CANNOT_BE_CONSUMED, sentReqHasBeenConsumedHandler)
            notificationsChannel.subscribe(realtimeHomepageNotificationKeys.RECEIVED_NEW_ROOM_JOIN_INVITE, receivedNewRoomJoinInviteHandler)
        }

        if (notificationsChannel.state === 'attached') {
            setupSubscriptions()
        } else {
            notificationsChannel.once('attached', setupSubscriptions)
        }

        return () => {
            notificationsChannel.off('attached', setupSubscriptions)
            notificationsChannel.unsubscribe(newFriendshipRequestHandler)
            notificationsChannel.unsubscribe(sentReqHasBeenConsumedHandler)
        }
    }, [
        notificationsChannel,
        notificationsChannel?.state,
        newFriendshipRequestHandler,
        sentReqHasBeenConsumedHandler,
    ])
}