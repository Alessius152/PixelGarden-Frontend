import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { closeSnackbar, enqueueSnackbar, type SnackbarKey, type SnackbarOrigin } from "notistack"
import type { ReactNode } from "react"
import { closeIcon } from "../svgs/icons"
import { MoveLeftIcon, MoveRightIcon } from "lucide-react"
import { useSwipeable } from "react-swipeable"
import type { AxiosError } from "axios"
import type { serverAPIErrorCode } from "../../enums/apiErrors"
import { apiErrorTraductions } from "../apiErrorsTraduction"

/*non per tutte le operazioni c'è bisogno di un feedback, per esempio quando voglio annullare una richiesta di amicizia inviata.
se la cancella, ok. non mostro nulla,
ma se c'è un errore che ne impedisce la cancellazione, snackbar di avviso. 

Alcune volte Solo in caso di errore*/

type deviceDet = {
    isMobile: boolean,
    isTablet: boolean,
    isDesktop: boolean,
}

type snackbarVariant = 'success' | 'error'

type defaultLayoutProps = {
    title: string | ReactNode,
    message: string | ReactNode,
    variant: snackbarVariant
}

type SnackbarKeyRef = { k: SnackbarKey | null }

const anchorOrigin: (deviceDetection: deviceDet) => SnackbarOrigin = (det) => ({
    vertical: det.isMobile ? 'bottom' : 'top',
    horizontal: det.isMobile ? 'center' : 'right'
})

const closingTip = (isDesktop: boolean, keyRef: SnackbarKeyRef, variant: snackbarVariant) => {
    const isSuccess = variant === 'success'
    return isDesktop ? (
        <Button size={'2xs'} p={0} borderRadius={8}
            colorPalette={isSuccess ? 'purple' : 'red'}
            variant={'surface'}
            onClick={() => { if (keyRef.k) closeSnackbar(keyRef.k) }}
        >{closeIcon}</Button>
    ) : (
        <Text fontSize={'xs'} display={'flex'} gap={2} alignItems={'center'} justifyContent={'right'} w={'full'} mt={1}>
            Swap per togliere {<MoveLeftIcon size={'12px'} />} {<MoveRightIcon size={'12px'} />}
        </Text>
    )
}

const defaultLayout: (props: defaultLayoutProps, deviceDetection: deviceDet, keyRef: SnackbarKeyRef) => ReactNode = (
    { title, message, variant },
    deviceDetection, keyRef
) => {
    const { isDesktop } = deviceDetection
    const handlers = useSwipeable({
        onSwipedLeft: () => { if (keyRef.k) closeSnackbar(keyRef.k) },
        onSwipedRight: () => { if (keyRef.k) closeSnackbar(keyRef.k) },
        trackMouse: true,
        trackTouch: true,
    })
    const isSuccess = variant === 'success'
    return <Flex
        direction={isDesktop ? 'row' : 'column'}
        background={
            isSuccess ?
                `linear-gradient(45deg, #f1dbff, #f6b3ff)` :
                `linear-gradient(45deg, #ffecdb, #ffb8b3)`
        }
        color={isSuccess ? 'black' : '#870000'}
        w="100%" borderRadius={12} p={4}
        gap={isDesktop ? 2 : 0}
        cursor={'pointer'}
        userSelect={'none'}
        {...handlers}
    >
        <Flex direction="column" gap={0.2} flex={1}>
            <Text fontSize="md">{title}</Text>
            <Box fontSize={'sm'}>
                {message}
            </Box>
        </Flex>

        {closingTip(isDesktop, keyRef, variant)}
    </Flex>
}

const defaultNetworkErrorSnackbar = (err: AxiosError, deviceDetection: deviceDet) => {
    const keyRef: SnackbarKeyRef = { k: null }

    keyRef.k = enqueueSnackbar('', {
        anchorOrigin: anchorOrigin(deviceDetection),
        content: () => (
            defaultLayout({
                title: 'Errore di rete!',
                message: <Flex direction={'column'}>
                    <Text>{err.code || 'Errore sconosciuto'}</Text>
                    <Text>Potresti essere offline, oppure il server non è raggiungibile.</Text>
                </Flex>,
                variant: 'error'
            }, deviceDetection, keyRef)
        )
    })
}

const serverErrorDefaultSnackbar = (err: serverAPIErrorCode, title: string | ReactNode, deviceDetection: deviceDet) => {
    const keyRef: SnackbarKeyRef = { k: null }

    keyRef.k = enqueueSnackbar('', {
        anchorOrigin: anchorOrigin(deviceDetection),
        content: () => (
            defaultLayout({
                title,
                message: <Flex direction={'column'}>
                    <Text maxWidth={312}>{apiErrorTraductions[err] || `Errore ${err}`}</Text>
                </Flex>,
                variant: 'error'
            }, deviceDetection, keyRef)
        ),
    })
}

const snackbarsByAction = (deviceDetection: deviceDet) => {
    return {
        sendFriendshipRequest: {
            success: (username: string) => {
                const keyRef: SnackbarKeyRef = { k: null }

                keyRef.k = enqueueSnackbar('', {
                    anchorOrigin: anchorOrigin(deviceDetection),
                    content: () => (
                        defaultLayout({
                            title: 'Richiesta inviata!',
                            message: <>Attendi che <b>{username}</b> risponda.</>,
                            variant: 'success'
                        }, deviceDetection, keyRef)
                    )
                })
            },
            err: {
                network: (err: AxiosError) => defaultNetworkErrorSnackbar(err, deviceDetection),
                server: (err: serverAPIErrorCode) => serverErrorDefaultSnackbar(err, 'Errore durante l\'invio!', deviceDetection)
            }
        },

        cancelSentFriendshipRequest: {
            success: {
                /**/
            },
            err: {
                network: (err: AxiosError) => defaultNetworkErrorSnackbar(err, deviceDetection),
                server: (err: serverAPIErrorCode) => serverErrorDefaultSnackbar(err, 'Annullamento fallito!', deviceDetection)
            }
        },

        cancelFriendship: {
            success: {},
            err: {
                network: (err: AxiosError) => defaultNetworkErrorSnackbar(err, deviceDetection),
                server: (err: serverAPIErrorCode) => serverErrorDefaultSnackbar(err, 'Cancellazione fallita!', deviceDetection)
            }
        },

        answerToReceivedFriendshipRequest: {
            /*qui la success viene mostrata solamente se viene accettata la richiesta*/
            success: (username: string) => {
                const keyRef: SnackbarKeyRef = { k: null }

                keyRef.k = enqueueSnackbar('', {
                    anchorOrigin: anchorOrigin(deviceDetection),
                    content: () => (
                        defaultLayout({
                            title: 'Richiesta accettata!',
                            message: <>Adesso tu e <b>{username}</b> siete amici!</>,
                            variant: 'success'
                        }, deviceDetection, keyRef)
                    )
                })
            },
            err: {
                network: (err: AxiosError) => defaultNetworkErrorSnackbar(err, deviceDetection),
                server: (err: serverAPIErrorCode) => serverErrorDefaultSnackbar(err, 'Errore nella risposta alla richiesta!', deviceDetection)
            }
        },

        createNewRoom: {
            success: () => {
                const keyRef: SnackbarKeyRef = { k: null }
                keyRef.k = enqueueSnackbar('', {
                    anchorOrigin: anchorOrigin(deviceDetection),
                    content: () => (
                        defaultLayout({
                            title: 'Stanza creata!',
                            message: <>Adesso puoi invitare i tuoi amici per disegnare insieme.</>,
                            variant: 'success'
                        }, deviceDetection, keyRef)
                    )
                })
            },
            err: {
                network: (err: AxiosError) => defaultNetworkErrorSnackbar(err, deviceDetection),
                server: (err: serverAPIErrorCode) => serverErrorDefaultSnackbar(err, "Errore durante la creazione della stanza.", deviceDetection)
            }
        },

        inviteFriendsIntoAPrivateRoom: {
            success: (totalSent: number) => {
                const keyRef: SnackbarKeyRef = { k: null }
                keyRef.k = enqueueSnackbar('', {
                    anchorOrigin: anchorOrigin(deviceDetection),
                    content: () => (
                        defaultLayout({
                            title: null,
                            message: <>{totalSent} inviti spediti.</>,
                            variant: 'success'
                        }, deviceDetection, keyRef)
                    )
                })
            },
            err: {
                network: (err: AxiosError) => defaultNetworkErrorSnackbar(err, deviceDetection),
                server: (err: serverAPIErrorCode) => serverErrorDefaultSnackbar(err, "Errore durante la spedizione degli inviti", deviceDetection)
            }
        }
    }
}

export {
    snackbarsByAction,
}
