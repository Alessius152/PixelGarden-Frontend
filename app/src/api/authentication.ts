
import axios from "axios"

import type { ApiCallReturn, httpHeader } from "../utils/types/global"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"

async function completeAuthentication(username: string, userId: string): Promise<ApiCallReturn> {

    const url = `${SERVER_BASE_URL}/auth/completeAuthentication`

    try {

        const headers: httpHeader = {}

        await signHttpHeaderWithFirebaseJwtToken(headers)

        const response = await axios.post(
            url,
            { username, userId },
            { headers }
        )
        
        if ('error' in response.data) {
            return { error: { type: 'server', ref: response } }
        }

        return response

    }
    catch (err) {
        return { error: { type: 'network', ref: err } }
    }

}

export {
    completeAuthentication,
}
