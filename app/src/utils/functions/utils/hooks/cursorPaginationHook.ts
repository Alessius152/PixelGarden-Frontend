
import type { AxiosRequestConfig } from "axios"
import { signHttpHeaderWithFirebaseJwtToken } from "../../../../services/firebase/authentication"

const setAuthorizationHeader = async (config: AxiosRequestConfig) => {
    if (!config.headers) {
        config.headers = {}
    }

    await signHttpHeaderWithFirebaseJwtToken(config.headers)

    return config
}

export {
    setAuthorizationHeader
}
