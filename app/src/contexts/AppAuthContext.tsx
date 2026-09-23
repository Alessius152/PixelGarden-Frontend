import { onAuthStateChanged } from "firebase/auth"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { firebaseAuth } from "../services/firebase/config"
import { getUserData } from "../api/user"
import type { AxiosResponse } from "axios"
import { HttpStatusCode } from "../utils/enums/http"
import type { clientAuthState, serverAuthState, serverUser } from "../utils/types/authentication"
interface AuthContextProps {
    firstAuth: clientAuthState,
    secondAuth: serverAuthState,
    isLoading: boolean,
    isAuthenticated: boolean,
    refreshServerAuth: () => Promise<void>,
    resetServerError: () => void,
    setSecondAuth: (user: serverUser) => void,
}

const defaultContextValue: AuthContextProps = {
    firstAuth: { status: 'loading' },
    secondAuth: { status: 'idle' },
    isLoading: true,
    isAuthenticated: false,
    refreshServerAuth: async () => { },
    resetServerError: () => { },
    setSecondAuth: () => { }
}

const AuthContext = createContext<AuthContextProps>(defaultContextValue)

export const AppAuthProvider = ({ children }: { children: ReactNode }) => {

    const [clientAuth, setClientAuth] = useState<clientAuthState>({ status: 'loading' })
    const [serverAuth, setServerAuth] = useState<serverAuthState>({ status: 'idle' })

    /* Calcoliamo isLoading in base agli stati attuali
    È "loading" se Firebase sta caricando OPPURE se l'utente è loggato su Firebase 
    ma il backend sta ancora caricando o è in idle.*/
    const isLoading =
        clientAuth.status === 'loading' ||
        (clientAuth.status === 'authenticated' && (serverAuth.status === 'loading' || serverAuth.status === 'idle'))

    const isAuthenticated = (clientAuth.status === 'authenticated') && (serverAuth.status === 'authenticated')

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (!user) {
                setClientAuth({ status: 'unauthenticated' })
                setServerAuth({ status: 'idle' })
            }
            else {
                setClientAuth({ status: 'authenticated', user })
            }
            console.log(await user?.getIdToken())
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        let isMounted = true

        if (clientAuth.status === 'authenticated') {
            refreshServerAuth()
        }

        return () => { isMounted = false }
    }, [clientAuth.status])

    async function refreshServerAuth() {
        setServerAuth({ status: 'loading' }) 

        const res = await getUserData()

        if ('error' in res) {
            if (res.error.type === 'network') {
                setServerAuth({ status: 'error', error: res.error })
                return
            }

            switch ((res.error.ref as AxiosResponse).status) {
                case HttpStatusCode.UNAUTHORIZED:
                    setServerAuth({ status: 'unauthorized' })
                    return
                case HttpStatusCode.NOT_FOUND:
                    setServerAuth({ status: 'needSecondAuth' })
                    return
                case HttpStatusCode.INTERNAL_SERVER_ERROR:
                    setServerAuth({ status: 'error', error: res.error })
                    break
            }
            return
        }

        const { uuid, username, userId } = res.data.userData.secondAuth
        setServerAuth({ status: 'authenticated', user: { uuid, username, userId } })
    }

    function resetServerError() {
        setServerAuth({ status: 'idle' })
    }

    return (
        <AuthContext.Provider value={{
            firstAuth: clientAuth,
            secondAuth: serverAuth,
            isLoading, 
            isAuthenticated,
            refreshServerAuth,
            resetServerError,
            setSecondAuth: (user) => setServerAuth({ status: 'authenticated', user })
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAppAuth = () => useContext(AuthContext)