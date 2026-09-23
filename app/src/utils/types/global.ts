import type { AxiosError, AxiosResponse, RawAxiosRequestHeaders } from "axios"

type loginProvider = 'google' | 'github'
type apiCallErrorType = 'network' | 'server'
type ApiCallErrorReturn_errorProp = { type: apiCallErrorType, ref: any }
type ApiCallErrorReturn = { error: ApiCallErrorReturn_errorProp }
type ApiCallReturn = AxiosResponse | ApiCallErrorReturn
type httpHeader = RawAxiosRequestHeaders
type globalUserSearchRecord = { uuid: string, username: string, userId: string }
type apiCallResult2 = { networkError: AxiosError } | AxiosResponse

export type {
    loginProvider,
    apiCallErrorType,
    ApiCallReturn,
    ApiCallErrorReturn_errorProp,
    ApiCallErrorReturn,
    httpHeader,
    globalUserSearchRecord,
    apiCallResult2
}
