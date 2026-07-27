import { serverAPIErrorCode } from "../enums/apiErrors"

const apiErrorTraductions: Record<serverAPIErrorCode, string> = {

    [serverAPIErrorCode.INTERNAL_SERVER_ERROR]: "Errore interno del server (500)",

    [serverAPIErrorCode.AUTH__MISSING_TOKEN]: "Errore di Autenticazione. prova a riavviare l'app.",
    [serverAPIErrorCode.AUTH__INVALID_TOKEN_STRUCTURE]: "Errore di Autenticazione. prova a rieseguire l'accesso.",
    [serverAPIErrorCode.AUTH__ERR_VERIFING_FIREBASE_TOKEN]: "L'errore è interno al server. prova a riavviare l'app.",
    [serverAPIErrorCode.AUTH__UNEXISTANT_USER]: "Non disponi di un account. Riavvia l'app per procedere al completamento del profilo.",

    [serverAPIErrorCode.COMPLETE_AUTH__ALREADY_AUTHED]: "Richiesta respinta (422): sei già autenticato. riavvia l'app e apparirà la homepage.",
    [serverAPIErrorCode.COMPLETE_AUTH__USER_ID_ALREADY_EXISTS]: "Lo user ID inserito è stato già preso. Puoi sceglierne un'ulteriore.",

    [serverAPIErrorCode.SEND_FSHIP_REQ__CANNOT_SEND_TO_YOURSELF]: "Non puoi mandarti una richiesta di amicizia.",
    [serverAPIErrorCode.SEND_FSHIP_REQ__DESTINATARY_DOESNT_EXISTS]: "Il destinatario non esiste.",
    [serverAPIErrorCode.SEND_FSHIP_REQ__ALREADY_FRIENDS]: "Tu e questo utente siete già amici.",
    [serverAPIErrorCode.SEND_FSHIP_REQ__REQ_BETWEEN_YOU_ALREADY_EXISTS]: "Esiste già una richiesta di amicizia in attesa tra te e questo utente.",

    [serverAPIErrorCode.ANSWER_TO_FSHIP_REQ__SPECIFIED_REQ_DOESNT_EXISTS]: "Impossibile rispondere. Richiesta non trovata.",

    [serverAPIErrorCode.CANCEL_SENT_FSHIP_REQ__REQ_NOT_FOUND]: "Richiesta non trovata.",

    [serverAPIErrorCode.CANCEL_FRIENDSHIP__RELATION_NOT_FOUND]: "Amicizia non esistente.",

    [serverAPIErrorCode.GENERIC_ROOM_NOT_FOUND]: "La stanza che hai indicato non è stata trovata.",

    [serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_NAME_UNIQUENESS_VIOLATION]: "Non puoi avere due stanze con lo stesso nome.",
    [serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_NAME_OUT_OF_LENGTH]: "Il nome della stanza deve avere dai 12 ai 48 caratteri.",
    [serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_DESCRIPTION_OUT_OF_LENGTH]: "La descrizione non può spingersi oltre i 380 caratteri.",

    [serverAPIErrorCode.FETCH_ROOMS_WHICHIN_USER_IS_MEMBER__FRIENDSHIP_NOT_FOUND]: "L'utente non è tuo amico.",

    [serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__NON_OF_THESE_RELATIONS_EXISTS]: "Richiesta non valida per il server. Nessun utente della lista è tuo amico.",
    [serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__NON_OF_THESE_RELATIONS_ARE_YOURS]: "Richiesta non valida per il server.",
    [serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__SPECIFIED_NON_VALID_MEMBERS]: "Richiesta non valida per il server. Hai specificato membri non aggiungibili.",

    [serverAPIErrorCode.CANCEL_ROOM_JOIN_INVITE__INVITE_NOT_FOUND]: "Nulla da cancellare. L'invito non esiste.",

    [serverAPIErrorCode.OBTAIN_ABLY_TKN_TO_ENTER_PV_ROOM_CHANNEL__ROOM_NOT_FOUND]: "La stanza alla quale cerchi di accedere non esiste.",
    [serverAPIErrorCode.OBTAIN_ABLY_TKN_TO_ENTER_PV_ROOM_CHANNEL__UNABLE_TO_ACCESS_THE_ROOM]: "Non sei autorizzato ad entrare in questa stanza.",

    [serverAPIErrorCode.FETCH_ROOM_DETAILS__MEMBERSHIP_NOT_FOUND]: "La stanza specificata non esiste, pertanto i dati non sono disponibili.",

}

export {
    apiErrorTraductions
}