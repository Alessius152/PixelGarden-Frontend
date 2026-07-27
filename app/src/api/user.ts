
import axios from 'axios'

import { SERVER_BASE_URL } from '../utils/objects/constants'
import { signHttpHeaderWithFirebaseJwtToken } from '../services/firebase/authentication'
import type { ApiCallReturn, httpHeader } from '../utils/types/global'
import { serverAPIErrorCode } from '../utils/enums/apiErrors'

/*api per capire se si è autenticati
possibili status: 200, 401, 404, 500*/
async function getUserData(): Promise<ApiCallReturn> {

    const url = `${SERVER_BASE_URL}/user/myAccountData`

    try {
        const headers: httpHeader = {}

        await signHttpHeaderWithFirebaseJwtToken(headers)

        if (!headers['Authorization']) {
            return {error: {type: 'server', ref: serverAPIErrorCode.AUTH__MISSING_TOKEN}}
        }
        
        const response = await axios.get(url, { headers, timeout: 10000 })

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
    getUserData,
}
