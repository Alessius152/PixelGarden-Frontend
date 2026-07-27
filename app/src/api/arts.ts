import type { AxiosError, RawAxiosRequestHeaders } from "axios"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import type { apiCallResult2 } from "../utils/types/global"
import axios from "axios"
import type { addCollabsBE, addCollabsFE, artCreationDataBE, artCreationDataFE, newLayerAddingBE, newLayerAddingFE } from "../utils/types/arts"

async function createNewArt({ wLayerID, height, name, scale, width }: artCreationDataFE): Promise<apiCallResult2> {

    const url = `${SERVER_BASE_URL}/arts/createPixelart`
    const headers: RawAxiosRequestHeaders = {}

    await signHttpHeaderWithFirebaseJwtToken(headers)

    const data: artCreationDataBE = {
        workingLayerId: wLayerID,
        artData: { name, height, width, logicPixelSize: scale },
    }

    try {
        const response = await axios.post(url, data, { headers })
        return response
    }
    catch (err) {
        return { networkError: err as AxiosError }
    }

}

async function addNewLayer({ artId, layerName, artLayersEditingToken }: newLayerAddingFE): Promise<apiCallResult2> {

    const url = `${SERVER_BASE_URL}/arts/addNewLayer`
    const headers = {}
    const data: newLayerAddingBE = { artId, layerName, artLayersEditingToken }

    await signHttpHeaderWithFirebaseJwtToken(headers)

    try {
        const response = await axios.post(url, data, { headers })
        return response
    } catch (err) {
        return { networkError: err as AxiosError }
    }

}

async function addCollaborators({ artId, membershipsId }: addCollabsFE): Promise<apiCallResult2> {

    const url = `${SERVER_BASE_URL}/arts/addCollaborators`
    const headers = {}
    const data: addCollabsBE = { artId, commit: membershipsId }

    await signHttpHeaderWithFirebaseJwtToken(headers)

    try {
        const response = await axios.post(url, data, { headers })
        return response
    }
    catch (err) {
        return { networkError: err as AxiosError }
    }

}

export default ({
    createNewArt,
    addNewLayer,
    addCollaborators,
})
