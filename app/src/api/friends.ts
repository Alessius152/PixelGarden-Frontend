
import axios, { AxiosError, type AxiosResponse, type RawAxiosRequestHeaders } from "axios"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import type { ApiCallReturn, httpHeader } from "../utils/types/global"
import type { FriendshipRequestAnswer } from "../utils/types/friends"
import { serverAPIErrorCode } from "../utils/enums/apiErrors"

/*questa funzione serve a mandare una richiesta di amicizia ad un utente*/
async function sendRequest(userUuidv7: string): Promise<ApiCallReturn> {

    const url = `${SERVER_BASE_URL}/friends/sendFriendshipRequest`

    try {

        const headers: httpHeader = {}

        await signHttpHeaderWithFirebaseJwtToken(headers)

        if (!headers['Authorization']) {
            return { error: { type: 'server', ref: serverAPIErrorCode.AUTH__MISSING_TOKEN } }
        }

        const response = await axios.post(url, { destinataryUuid: userUuidv7 }, { headers })

        if ('error' in response.data) {
            return { error: { type: 'server', ref: response } }
        }

        return response

    }
    catch (err) {
        return { error: { type: 'network', ref: err } }
    }

}

async function cancelSentRequest(requestId: string): Promise<ApiCallReturn> {

    const url = `${SERVER_BASE_URL}/friends/cancelSentFriendshipRequest`
    const headers: httpHeader = {}

    await signHttpHeaderWithFirebaseJwtToken(headers)

    try {

        if (!headers['Authorization']) {
            return { error: { type: 'server', ref: 'missingToken' } }
        }

        const response = await axios.delete(url, {
            headers,
            data: { requestId }
        })

        if ('error' in response.data) {
            return { error: { type: 'server', ref: response.data.error } }
        }

        return response

    }
    catch (err) {
        return { error: { type: 'network', ref: err } }
    }

}

async function answerToRequest(requestId: string, answer: FriendshipRequestAnswer): Promise<ApiCallReturn> {

    const url = `${SERVER_BASE_URL}/friends/answerToFriendshipRequest`
    const headers: httpHeader = {}

    await signHttpHeaderWithFirebaseJwtToken(headers)

    if (!headers.Authorization) {
        return { error: { type: 'server', ref: 'missingToken' } }
    }

    try {

        const data = { requestId, answer }
        const response = await axios.post(url, data, { headers })

        if ('error' in response.data) {
            return { error: { type: 'server', ref: response } }
        }

        return response

    }
    catch (err) {
        return { error: { type: 'network', ref: err } }
    }

}

async function cancelFriendship(relationId: string): Promise<AxiosError | AxiosResponse> {

    const url = `${SERVER_BASE_URL}/friends/cancelFriendship`
    const headers: RawAxiosRequestHeaders = {}

    try {

        await signHttpHeaderWithFirebaseJwtToken(headers)

        const response = await axios.delete(url, {
            headers,
            data: { relationId }
        })

        return response

    }
    catch (err) {
        return (err as AxiosError)
    }

}

export default ({
    sendRequest,
    cancelSentRequest,
    answerToRequest,
    cancelFriendship,
})
