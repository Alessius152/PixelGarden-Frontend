import type { AxiosError, AxiosResponse, RawAxiosRequestHeaders } from "axios"

type loginProvider = 'google' | 'github'

type apiCallErrorType = 'network' | 'server'
type ApiCallErrorReturn_errorProp = { type: apiCallErrorType, ref: any }
type ApiCallErrorReturn = { error: ApiCallErrorReturn_errorProp }
type ApiCallReturn = AxiosResponse | ApiCallErrorReturn

type httpHeader = RawAxiosRequestHeaders

type globalUserSearchRecord = { uuid: string, username: string, userId: string }














/*
prima usavo questo metodo per identificare gli errori dalle chiamate api
davo un type che faceva capire se era server error (401, 404 etc.) o un network error,
ORA no, solo network errore, perché il server error starebbe come risposta api avente prop "error"
quindi io intercetto lato componente solo il network error e non sempre voglio mostrare errore 
esplicito in caso di server error*/
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
