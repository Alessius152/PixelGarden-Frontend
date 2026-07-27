import './View.css'

import Screen1 from '../../../assets/backgrounds/loadingViews/initialAuthVerify/screen1.webp'

import { Box, Dialog, Portal, Spinner, Text, Link, Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AxiosResponse } from 'axios'

import { useDeviceDetection } from '../../../contexts/DeviceDetectorContext'
import { useAppAuth } from '../../../contexts/AppAuthContext'
import { appRoutes } from '../../../utils/objects/objects'
import { logout } from '../../../services/firebase/authentication'
import { MotionBox } from '../../../utils/objects/ui'
import { serverAPIErrorCode } from '../../../utils/enums/apiErrors'
import { apiErrorTraductions } from '../../../utils/objects/apiErrorsTraduction'

function LoadingDots() {
    const [dotsCount, setDotsCount] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setDotsCount(prev => (prev === 3 ? 1 : prev + 1))
        }, 750)

        return () => clearInterval(interval)
    }, [])

    return <>{".".repeat(dotsCount)}</>
}

function View({}: {}) {
    const { isMobile, isResolved } = useDeviceDetection()
    const { firstAuth, secondAuth, refreshServerAuth } = useAppAuth()
    const navigate = useNavigate()

    const centralBox = (!('error' in secondAuth)) && (
        <MotionBox className="central-box" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
            <Box className="top-text" mb={6}>
                <Text color="white" fontSize={isMobile ? 'xl' : '3xl'} fontWeight="bold" textAlign="center">
                    Benvenuto o bentornato in <span style={{ color: '#FFD700' }}>PixelGarden</span>
                </Text>
                <Text color="gray.300" fontSize="md" fontWeight="medium" textAlign="center" mt={2}>Stiamo verificando tutto per farti continuare nell'app.</Text>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1}>
                <Spinner size="xl" color="pink" />
                <Text mt={4} color="gray.200" fontSize="sm" textAlign="center">
                    Verifica in corso<LoadingDots /> attendi qualche istante
                </Text>
            </Box>
        </MotionBox>
    )

    const loadingView = (
        <MotionBox className="initial-auth-loading-view" backgroundImage={`url(${Screen1})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        >
            <MotionBox className="overlay-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ backgroundColor: 'rgba(0,0,0,0.45)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {centralBox}
            </MotionBox>
        </MotionBox>
    )

    const serverAuthErrDialog = () => {
        if (!('error' in secondAuth)) return null

        const error = secondAuth.error

        console.log("ER", error)

        return (
            <Dialog.Root open placement="center">
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content bgColor="pink.100" margin={isMobile ? 2 : 0} borderRadius="4xl">
                            <Dialog.Header>
                                <Dialog.Title>Si è verificato un errore durante l'autenticazione</Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body overflow="auto" maxHeight={500} fontSize={12}>
                                {error.type === 'network' ? (
                                    <Box display="flex" flexDirection="column" gap={4}>
                                        <Text fontSize="14px" color="gray.700">Errore di rete. Verifica la connessione o riprova più tardi.</Text>
                                        <Box bgColor="gray.600" borderRadius="3xl" p={6}>
                                            <Text fontWeight="bold" mb={2} color="gray.100">Dettagli tecnici</Text>
                                            <Box fontSize={11} color="gray.200">
                                                <Text>Codice: {error.ref.code || 'Sconosciuto'}</Text>
                                                <Text>Messaggio: {error.ref.message || 'Sconosciuto'}</Text>
                                            </Box>
                                            <Text fontSize="13px" mt={2} color="gray.400">
                                                Ripeti il login da{' '}
                                                <Link onClick={logout} color="pink.300" fontWeight="semibold">qui</Link>.
                                            </Text>
                                        </Box>
                                    </Box>
                                ) : (
                                    (() => {
                                        const serverErr = error.ref as AxiosResponse

                                        return (
                                            <Box display="flex" flexDirection="column" gap={4}>
                                                <Text fontSize="14px" color="gray.700">Errore lato server durante l'autenticazione.</Text>
                                                <Box bgColor="gray.600" borderRadius="md" p={3}>
                                                    <Text fontWeight="bold" mb={2} color="gray.100">Dettagli tecnici</Text>
                                                    <Box fontSize={11} color="gray.200">
                                                        <Text>Codice: {serverErr.data.error || 'Sconosciuto'}</Text>
                                                        <Text>
                                                            Messaggio:{' '}
                                                            {apiErrorTraductions[
                                                                serverErr.data.error as serverAPIErrorCode
                                                            ] || serverErr.data.error}
                                                        </Text>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )
                                    })()
                                )}
                            </Dialog.Body>

                            <Dialog.Footer justifyContent={isMobile ? 'center' : 'flex-end'}>
                                <Button colorPalette="pink" borderRadius={16} onClick={refreshServerAuth}>Riprova</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        )
    }

    useEffect(() => {
        if (firstAuth.status === 'loading') return

        if (firstAuth.status === 'unauthenticated') {
            navigate(appRoutes.FIRST_AUTH)
            return
        }

        if (secondAuth.status === 'loading') return

        if (secondAuth.status === 'unauthorized') {
            navigate(appRoutes.FIRST_AUTH)
            return
        }

        if (secondAuth.status === 'needSecondAuth') {
            navigate(appRoutes.SECOND_AUTH)
            return
        }

        if (secondAuth.status === 'authenticated') {
            navigate(appRoutes.HOMEPAGE.ROOT)
        }
    }, [firstAuth, secondAuth, navigate])

    if (!isResolved) return null

    return (
        <>
            {loadingView}
            {('error' in secondAuth) && serverAuthErrDialog()}
        </>
    )
}

export default View