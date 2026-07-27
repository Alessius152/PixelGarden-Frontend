
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, type UserCredential } from "firebase/auth"
import { firebaseAuth } from "./config"
import type { RawAxiosRequestHeaders } from "axios"
import { JWT_PREFIX } from "../../utils/objects/constants"

type loginProvider = GoogleAuthProvider | GithubAuthProvider

const googleProvider: loginProvider = new GoogleAuthProvider()
const githubProvider: loginProvider = new GithubAuthProvider()

googleProvider.setCustomParameters({
    prompt: "select_account"
})
githubProvider.setCustomParameters({
    prompt: "select_account"
})

const loginWithProvider = async (provider: loginProvider) => {
    try {
        const login = await signInWithPopup(firebaseAuth, provider)
        return login
    }
    catch (err) {
        return 'err'
    }
}

async function loginWithGoogle(): Promise<UserCredential | 'err'> {
    return await loginWithProvider(googleProvider)
}

async function loginWithGithub(): Promise<UserCredential | 'err'> {
    return await loginWithProvider(githubProvider)
}

async function logout() {
    await signOut(firebaseAuth)
}

async function getAuthToken(): Promise<null | string> {
    if (!firebaseAuth.currentUser) {
        return null
    }

    return await firebaseAuth.currentUser.getIdToken()
}

/*
questa funzione aggiunge il token all'header http se c'è
*/
async function signHttpHeaderWithFirebaseJwtToken(header: RawAxiosRequestHeaders): Promise<void> {

    const token = await getAuthToken()

    if (!token) {
        return
    }

    const authorization = `${JWT_PREFIX}${token}`

    header['Authorization'] = authorization
    return

}

export {
    loginWithGoogle,
    loginWithGithub,
    logout,
    getAuthToken,
    signHttpHeaderWithFirebaseJwtToken,
}
