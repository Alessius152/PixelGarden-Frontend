import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import * as Ably from "ably"
import { AblyProvider } from "ably/react"
import { useAppAuth } from "./AppAuthContext"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import axios from "axios"
import type { RealtimeChannel } from "ably"
import { generatePersistentColor } from "../utils/objects/ui"
import { fetchRoomDetails } from "../api/rooms"
import { useQuery, useQueryClient, type InfiniteData, type UseQueryResult } from "@tanstack/react-query"
import type { pixelartsListFromBackend, receivedJoiningInvite, roomDetailsFromBackend } from "../utils/types/rooms"
import type { notification_newArtCreated, notification_newArtLayerCreated, notification_newCollabsAdded } from "../utils/types/realtime/notifications/arts"
import type { PixelGardenPresenceMessage } from "../utils/types/ably"
import { useRealtimeHandlers } from "../hooks/useRealtimeHandlers"
import type { friendDataFromBackend, receivedFriendshipRequestFromBackend } from "../utils/types/friends"
import { useFriendsContext } from "./FriendsContext"
import { useFriendshipRequestsContext } from "./FriendshipRequestsContext"
import type { ArtLayer, ArtLayersResponse, pixelartCollaboratorsListFromBackend } from "../utils/types/arts"
import { createEmptyTransparentBitmap, GLOBAL_nativeTextureCache } from "../utils/functions/drawing"

type workingRoomProp = {
    channel: RealtimeChannel | undefined,
    members: Array<PixelGardenPresenceMessage>,
    details: UseQueryResult<roomDetailsFromBackend, Error> | null,
    workingLayer: {
        get: string | null,
        set: (id: string | null) => void
    }
    join: (roomId: string) => Promise<void>,
    leave: () => Promise<void>
}

interface RealtimeContextProps {
    client: Ably.Realtime | null
    connState: Ably.ConnectionState | "idle"
    homeNotifications?: RealtimeChannel
    workingRoom: workingRoomProp
}

const RealtimeContext = createContext<RealtimeContextProps>({
    client: null,
    connState: "idle",
    homeNotifications: undefined,
    workingRoom: {
        channel: undefined,
        members: [],
        details: null,
        workingLayer: {
            get: null,
            set: () => { }
        },
        join: async () => { },
        leave: async () => { }
    }
})

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {

    const { firstAuth, secondAuth } = useAppAuth()

    const [client, setClient] = useState<Ably.Realtime | null>(null)
    const [connState, setConnState] = useState<Ably.ConnectionState | "idle">("idle")

    const [notificationsChannel, setNotificationsChannel] = useState<RealtimeChannel>()

    const [roomChannel, setRoomChannel] = useState<RealtimeChannel>()
    const [members, setMembers] = useState<Array<PixelGardenPresenceMessage>>([])

    const currentRoomIdRef = useRef<string | null>(null)

    const qClient = useQueryClient()

    const friendsCtx = useFriendsContext()
    const friendReqsCtx = useFriendshipRequestsContext()

    const userUuid = secondAuth.status === "authenticated" ? secondAuth.user.uuid : null
    const isAuthenticated = (firstAuth.status === "authenticated") && (secondAuth.status === "authenticated")

    const roomDetails = useQuery<roomDetailsFromBackend, Error>({
        queryKey: ['room', currentRoomIdRef.current],
        queryFn: async () => {
            const response = await fetchRoomDetails(currentRoomIdRef.current!)
            if ('networkError' in response) {
                throw new Error(`${response.networkError.code}:::${response.networkError.message}`)
            }
            if ('error' in response.data) {
                throw new Error(response.data.error)
            }
            return response.data
        },
        retry: true,
        retryDelay: 3000,
        enabled: isAuthenticated && (!!currentRoomIdRef.current),
        refetchOnWindowFocus: false
    })

    const authCallback = useCallback(async (
        _params: Ably.TokenParams,
        callback: (error: Ably.ErrorInfo | string | null, tokenRequestOrDetails: Ably.TokenDetails | Ably.TokenRequest | string | null) => void
    ) => {
        try {
            const headers = {}
            await signHttpHeaderWithFirebaseJwtToken(headers)

            const response = await axios.get(
                `${SERVER_BASE_URL}/realtime/ably/token`,
                {
                    headers,
                    params: currentRoomIdRef.current
                        ? { roomId: currentRoomIdRef.current }
                        : {}
                }
            )

            callback(null, response.data)
        } catch (err) {
            callback(err as any, null)
        }
    }, [])

    const [focusedWLayer, setFocusedWLayer] = useState<string | null>(null)

    const workingRoom: workingRoomProp = useMemo(() => ({
        channel: roomChannel,
        members: members,
        details: roomDetails,
        workingLayer: {
            get: focusedWLayer,
            set: (id: string | null) => setFocusedWLayer(id)
        },
        join: async (roomId) => {
            try {
                const cName = `wroom:${roomId}`
                currentRoomIdRef.current = roomId

                await client?.auth.authorize()
                const channel = client?.channels.get(cName)
                await channel?.attach()
                setRoomChannel(channel)

            } catch (err) {
                console.error("Fallimento durante il join della stanza:", err)
                currentRoomIdRef.current = null
                setRoomChannel(undefined)
            }
        },
        leave: async () => {
            const channel = roomChannel
            if (channel) {
                try {
                    channel.unsubscribe()
                    await channel.detach()
                }
                catch (err) {
                    console.error("ERRORE DETACHING CANALE", { err })
                }
                currentRoomIdRef.current = null
                setRoomChannel(undefined)
                setMembers([])
            }
        }
    }), [roomChannel, client, members, focusedWLayer])

    const getWorkingLayerByUsersPublicIdentifier = (at: string) => {
        return roomDetails.data?.roomData.members.find(m => (m[0] === at))?.[2].wLayerId
    }

    const addFrManually = useCallback((fr: friendDataFromBackend) => {
        friendsCtx.methods.addFriendManually(fr)
    }, [friendsCtx.methods.addFriendManually])

    const addRecReq = useCallback((req: receivedFriendshipRequestFromBackend) => {
        friendReqsCtx.receivedReqsMethods.addReceivedReq(req)
    }, [friendReqsCtx.receivedReqsMethods.addReceivedReq])

    const cancSentReq = useCallback((reqId: string) => {
        friendReqsCtx.sentReqsMethods.cancelSentReq(reqId)
    }, [friendReqsCtx.sentReqsMethods.cancelSentReq])

    const addReceivedRoomJoinInvite = useCallback((req: receivedJoiningInvite) => {
    }, [])

    const handlersReference = useMemo(() => ({
        addFrManually,
        addRecReq,
        cancSentReq,
        addReceivedRoomJoinInvite,
    }), [addFrManually, addRecReq, cancSentReq])

    useRealtimeHandlers(notificationsChannel, handlersReference)

    useEffect(() => {
        if (!isAuthenticated) {
            if (client) {
                client.close()
                setClient(null)
            }
            return
        }

        const realtime = new Ably.Realtime({
            authCallback,
            autoConnect: true,
            echoMessages: false,
            clientId: secondAuth.user.uuid
        })

        realtime.connection.on(stateChange => {
            setConnState(stateChange.current)
        })

        setClient(realtime)

        return () => {
            realtime.close()
        }
    }, [isAuthenticated, authCallback])

    // NOTIFICATIONS CHANNEL
    useEffect(() => {
        if (!client || !userUuid) return

        const onConnected = () => {
            console.log("CONNESSO AD ABLY", client.clientId)
        }
        client.connection.on('connected', onConnected)

        const channel = client.channels.get(`pvt:user:${userUuid}:notifications`)
        channel.attach()

        setNotificationsChannel(channel)

        return () => {
            client.connection.off("connected", onConnected)
            channel.detach()
            channel.unsubscribe()
        }
    }, [client, userUuid])

    useEffect(() => {
        if (secondAuth.status !== 'authenticated' || !workingRoom.channel || !client) {
            setMembers([])
            return
        }

        const channel = workingRoom.channel

        const handleNewArt = (msg: Ably.InboundMessage) => {
            const { headers, artData } = msg.data as notification_newArtCreated

            if (headers.rtClientId === client.clientId) return

            const usersWLayer = getWorkingLayerByUsersPublicIdentifier(headers.userAt)

            if (!usersWLayer) {
                qClient.invalidateQueries({ queryKey: ['pixelartsList'] })
                return
            }

            qClient.setQueryData<pixelartsListFromBackend>(
                ['pixelartsList', roomDetails.data?.roomData.basic[0], usersWLayer],
                (oldData) => {
                    if (!oldData) return oldData

                    //evita duplicato perche il messaggio arriva a tutti (anche a chi l'ha mandato)
                    if (oldData.pixelarts.some(a => a.artId === artData.artId)) return oldData

                    return {
                        ...oldData,
                        pixelarts: [{ ...artData }, ...oldData.pixelarts]
                    }
                }
            )
        }

        const handleNewArtLayerAdded = async (msg: Ably.InboundMessage) => {
            const { headers, artId, layerData } = msg.data as notification_newArtLayerCreated

            if (headers.rtClientId === client.clientId) return

            const [w, h] = layerData.dim
            GLOBAL_nativeTextureCache[layerData.uuid] = await createEmptyTransparentBitmap(w, h)

            qClient.setQueryData<InfiniteData<ArtLayersResponse>>(
                ['artLayersList', artId],
                (oldData) => {
                    if (!oldData) return oldData

                    const newLayer: ArtLayer = {
                        metadata: [layerData.uuid, layerData.name, layerData.orderIndex],
                        owner: [layerData.owner[0], layerData.owner[1]]
                    }

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page, index) => {
                            if (index === 0) return { ...page, layers: [newLayer, ...page.layers] }
                            return page
                        })
                    }
                }
            )
        }

        const handleNewCollaboratorsAdded = (msg: Ably.InboundMessage) => {
            const { artId, collaborators: newCollabs } = msg.data as notification_newCollabsAdded

            qClient.setQueryData<pixelartCollaboratorsListFromBackend>(
                ['pixelartCollaboratorsList', artId],
                (oldData) => {
                    if (!oldData) return oldData

                    const collaboratorsMap = new Map<string, string>()
                    oldData.collaborators.forEach(([id, name]) => collaboratorsMap.set(id, name))
                    newCollabs.forEach(([id, name]) => collaboratorsMap.set(id, name))

                    return {
                        ...oldData,
                        collaborators: Array.from(collaboratorsMap.entries())
                    }
                }
            )
        }

        const setupRoom = async () => {
            try {
                await channel.subscribe('member-created-new-art', handleNewArt)
                await channel.subscribe('added-new-art-layer', handleNewArtLayerAdded)
                await channel.subscribe('new-collabs-added-to-art', handleNewCollaboratorsAdded)

                const onPresence = (member: Ably.PresenceMessage) => {
                    const pixelMember = member as PixelGardenPresenceMessage

                    setMembers(prev => {
                        const filtered = prev.filter(m => m.clientId !== pixelMember.clientId)
                        return pixelMember.action === 'leave' ? filtered : [...filtered, pixelMember]
                    })
                }

                await channel.presence.subscribe('enter', onPresence)
                await channel.presence.subscribe('leave', onPresence)
                await channel.presence.subscribe('update', onPresence)

                const currentMembers = await channel.presence.get()
                setMembers(currentMembers)

                const { username, userId } = secondAuth.user
                await channel.presence.enter({ username, userId, color: generatePersistentColor(userId) })
            } catch (err) {
                console.error("Errore Setup Room:", err)
            }
        }

        if (channel.state === 'attached') {
            setupRoom()
        } else {
            channel.once('attached', setupRoom)
        }

        return () => {
            channel.unsubscribe()
            channel.presence.unsubscribe()
        }
    }, [client, workingRoom.channel, secondAuth.status])

    useEffect(() => {
        if (!roomDetails.data) {
            return
        }
        if (!(secondAuth.status === 'authenticated')) {
            return
        }
        const myLayer = roomDetails.data.roomData.members.find(m => (m[0] === secondAuth.user.userId))?.[2].wLayerId || null
        setFocusedWLayer(myLayer)
    }, [roomDetails.data, secondAuth])

    if (!(secondAuth.status === 'authenticated')) {
        return
    }
    return (
        <RealtimeContext.Provider value={{
            client, connState,
            homeNotifications: notificationsChannel,
            workingRoom
        }}>
            {client ? (
                <AblyProvider client={client}>
                    {children}
                </AblyProvider>
            ) : children}
        </RealtimeContext.Provider>
    )
}

export const useRealtime = () => useContext(RealtimeContext)