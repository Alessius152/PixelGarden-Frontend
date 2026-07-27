import type { User } from "firebase/auth"
import type { ApiCallErrorReturn_errorProp } from "./global"

type clientAuthState =
    | { status: 'loading' | 'unauthenticated' }
    | { status: 'authenticated', user: User }

type serverUser = { uuid: string, username: string, userId: string }
type serverAuthState =
    | { status: 'idle' | 'loading' | 'needSecondAuth' | 'unauthorized' }
    | { status: 'authenticated', user: serverUser }
    | { status: 'error', error: ApiCallErrorReturn_errorProp }

export type {
    clientAuthState, serverUser, serverAuthState,
}
