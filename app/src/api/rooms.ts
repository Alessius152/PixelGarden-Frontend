
import type { AxiosError } from "axios"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import axios from "axios"
import type { roomCreationData } from "../utils/types/rooms"
import type { apiCallResult2 } from "../utils/types/global"

async function createRoom(data: roomCreationData): Promise<apiCallResult2> {

    const url = `${SERVER_BASE_URL}/rooms/createNewRoom`
    const headers = {}

    await signHttpHeaderWithFirebaseJwtToken(headers)

    try {
        const response = await axios.post(url, data, { headers })
        return response
    }
    catch (err) {
        return { networkError: err as AxiosError }
    }

}

async function fetchRoomDetails(roomId: string): Promise<apiCallResult2> {

    const url = `${SERVER_BASE_URL}/rooms/roomDetails/${roomId}`
    const headers = {}

    await signHttpHeaderWithFirebaseJwtToken(headers)

    try {

        const response = await axios.get(url, { headers })
        return response

    }
    catch (err) {
        return { networkError: err as AxiosError }
    }

}

async function inviteFriendsIntoARoom(roomId: string, relations: Array<string>): Promise<apiCallResult2> {

    const url = `${SERVER_BASE_URL}/rooms/addMembers`
    const headers = {}

    const data = {
        roomId,
        commit: {
            add: relations
        }
    }

    await signHttpHeaderWithFirebaseJwtToken(headers)

    try {

        const response = await axios.post(url, data, { headers })
        return response

    }
    catch (err) {
        return { networkError: err as AxiosError }
    }

}

export {
    createRoom,
    fetchRoomDetails,
    inviteFriendsIntoARoom,
}