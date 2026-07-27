import './Page.css'

import { Box, Button, createToaster, Heading, Image, Link, Popover, Portal, Text, Toaster, Tooltip } from '@chakra-ui/react'
import { motion } from "framer-motion"
import { Info } from "lucide-react"

import DesktopWallpaper from '../../assets/backgrounds/secondAuth/bg-desktop-tablet.webp'
import MobileWallpaper from '../../assets/backgrounds/secondAuth/bg-mobile.webp'

import { useEffect, useState } from 'react'
import { useDeviceDetection } from '../../contexts/DeviceDetectorContext'
import { useAppAuth } from '../../contexts/AppAuthContext'
import { useNavigate } from 'react-router-dom'

import { logout } from '../../services/firebase/authentication'
import { completeAuthentication } from '../../api/authentication'
import type { ApiCallReturn } from '../../utils/types/global'
import { appRoutes } from '../../utils/objects/objects'
import { getContrastColor, MotionBox, MotionInput, profilePicPlaceholderBgColor } from '../../utils/objects/ui'
import { validateUsernamesFirstLetter } from '../../utils/functions/dataValidation'
import { serverAPIErrorCode } from '../../utils/enums/apiErrors'
import { apiErrorTraductions } from '../../utils/objects/apiErrorsTraduction'

const MotionDiv = motion.div

const toaster = createToaster({
    placement: 'top-start',
})

function SecondAuth() {

    const { isResolved, isMobile, isTablet, isDesktop } = useDeviceDetection()
    const { firstAuth, secondAuth, setSecondAuth } = useAppAuth()

    const navigate = useNavigate()

    const bgWallpaper = () => ((isDesktop || isTablet) ? DesktopWallpaper : MobileWallpaper)

    const [mobile_popOverOpen, setMobile_popOverOpen] = useState(false)
    const [username, setUsername] = useState<string>('')
    const [userId, setUserId] = useState<string>('')

    //risultato della risposta del server dall'api /auth/completeAuthentication 
    const [callResponse, setCallResponse] = useState<ApiCallReturn | 'loading' | null>(null)

    const desktopUsernameTooltip = (
        <Tooltip.Root>
            <Tooltip.Trigger asChild><Info size={18} /></Tooltip.Trigger>
            <Portal>
                <Tooltip.Positioner>
                    <Tooltip.Content bgColor={'#ffb0b0ff'} color={'black'}>
                        <Tooltip.Arrow><Tooltip.ArrowTip /></Tooltip.Arrow>
                        Lo <b>username</b> deve avere un numero di caratteri compreso tra 8 e 32.
                        <br /> <br />
                        Sono ammesse lettere, numeri e _.
                        <br /> <br />
                        Il nome deve iniziare con una lettera.
                        <br /> <br />
                        Lo <b>userId</b> ha le stesse regole dello username e deve essere univoco a livello globale
                    </Tooltip.Content>
                </Tooltip.Positioner>
            </Portal>
        </Tooltip.Root>
    )

    const mobileUsernameTipPopover = (
        <Popover.Root open={mobile_popOverOpen} onOpenChange={(e) => setMobile_popOverOpen(e.open)}>
            <Popover.Trigger asChild>
                <Info size={18} />
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content>
                        <Popover.Body bgColor={'#960064ff'} borderRadius={4} color={'white'} fontSize={'10px'}>
                            Lo <b>username</b> deve avere un numero di caratteri compreso tra 8 e 32.
                            <br />
                            Sono ammesse lettere, numeri e _.
                            <br />
                            Il nome deve iniziare con una lettera.
                            <br />
                            Lo <b>userId</b> ha le stesse regole dello username e deve essere univoco a livello globale
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    )

    useEffect(() => {
        if (firstAuth.status === 'loading') {
            navigate(appRoutes.ROOT)
            return
        }
        if (firstAuth.status === 'unauthenticated') {
            navigate(appRoutes.FIRST_AUTH)
            return
        }
        if (secondAuth.status === 'authenticated') {
            navigate(appRoutes.HOMEPAGE.ROOT)
            return
        }
    }, [firstAuth, secondAuth])

    if (!(isResolved && ('user' in firstAuth))) return null

    const usedProvider = firstAuth.user.providerData[0].providerId
    const providersLabelMap = {
        'google.com': 'Google',
        'github.com': 'Github',
    }

    return (
        <div
            className="second-auth"
            style={{ backgroundImage: `url('${bgWallpaper()}')` }}
        >
            <MotionDiv className="extend-wrapper" style={{ padding: isMobile ? '8px' : '3rem' }} transition={{ duration: 1.2, ease: 'easeOut' }}>
                <motion.div className="content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                    <div className="header">
                        <Heading
                            as="h1"
                            size={isMobile ? 'lg' : '3xl'}
                            fontWeight="bold"
                            textAlign="center"
                            className="title-voice"
                            color="rgb(255, 255, 255)"
                            m={isMobile ? '0px' : '48px'}
                            background={isMobile ? "linear-gradient(70deg, #ed8eed, #3a0658, #e416da)" : "linear-gradient(70deg, #ed8e8e, #580606, #e41616)"}
                            backgroundSize="300% 300%"
                            animation="gradient-animation 12s ease infinite"
                            p={isMobile ? 2 : 6}
                            borderRadius={18}
                        >Ti manca un ultimo passaggio
                            <Text className='subtitle-voice' fontSize={isMobile ? 'xs' : 14} lineHeight={1.2}
                            >Compila questo modulo di autenticazione per proseguire nell'applicazione</Text>
                        </Heading>
                    </div>
                    <motion.div className="main" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                        <Box className="auth-finalization-form" borderRadius={'2xl'} p={8} maxW="340px" minH={'340px'} bgColor={isMobile ? 'rgb(254, 232, 255)' : 'rgba(255, 232, 232, 1)'}>
                            <div className="head">
                                <Text fontSize={isMobile ? 14 : 18} textAlign={'center'} >
                                    Sei autenticato con&nbsp;
                                    {
                                        true ?
                                            (<b style={{ color: isMobile ? 'purple' : '#690606ff' }}>{providersLabelMap[usedProvider as keyof typeof providersLabelMap]}</b>) :
                                            (<b style={{ color: '#221b51ff' }}>Github</b>)
                                    }
                                </Text>
                                <Text fontSize={isMobile ? 10 : 12} textAlign={'center'}  >Se vuoi cambiare provider premi <Link color={isMobile ? 'magenta' : 'tomato'} onClick={logout}>Qui</Link></Text>
                            </div>
                            <div className="profile-picture-selection-box" style={{ paddingBlock: isDesktop ? '24px' : '12px' }}>
                                <div className="left">
                                    {
                                        false ? (
                                            <Image src="https://bit.ly/narut2o-sag e" boxSize="98px" borderRadius="full" fit="cover" border={'1px solid black'} />
                                        ) : (
                                            <Box boxSize={'98px'} borderRadius="full" border={'1px solid black'} className='no-profile-photo-selected'
                                                bgColor={(username && validateUsernamesFirstLetter(username)) ? profilePicPlaceholderBgColor(username) : '#5d5d5dff'}
                                                fontSize={32} fontWeight={400} color={'white'}
                                            >
                                                {
                                                    (<span style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Box fontSize={32}>
                                                            {(username && validateUsernamesFirstLetter(username)) ? username[0].toUpperCase() : '?'}
                                                        </Box>
                                                        <Box fontSize={8} textAlign={'center'} color={getContrastColor(profilePicPlaceholderBgColor(username))}>nessuna foto <br /> inserita</Box>
                                                    </span>)
                                                }
                                            </Box>
                                        )
                                    }
                                </div>
                                <div className="right" style={{ justifyContent: isMobile ? 'center' : 'space-between' }}>
                                    <Text className="requirements" fontSize={isMobile ? '10px' : '12px'} textAlign={'right'}>La foto deve essere in formato di dimensione 64x64 o 128x128.</Text>
                                    <Button size="xs" bg={isMobile ? 'purple' : '#800000'} _hover={{ bg: isMobile ? '#905088ff' : '#905050ff' }}
                                        borderRadius={'full'}
                                        {...(isMobile ? { height: 'max-content', paddingBlock: 1 } : {})} fontSize={isMobile ? '10px' : '12px'}
                                    >Scegli foto</Button>
                                </div>
                            </div>
                            <div className="username-input-area">
                                <MotionInput
                                    placeholder="Inserisci uno Username"
                                    variant="flushed"
                                    borderColor={isMobile ? "magenta" : 'tomato'}
                                    onChange={(e) => { setUsername(e.target.value) }}
                                    whileFocus={{ scale: 1.05, borderColor: "#ff00ff" }} 
                                    transition={{ type: "spring", stiffness: 300 }}
                                />
                                <MotionInput
                                    placeholder="Scegli uno userId"
                                    variant="flushed"
                                    borderColor={isMobile ? "magenta" : "tomato"}
                                    onChange={(e) => setUserId(e.target.value)}
                                    whileFocus={{ scale: 1.05, borderColor: "#ff00ff" }} 
                                    transition={{ type: "spring", stiffness: 300 }}
                                />
                                {isDesktop ? desktopUsernameTooltip : mobileUsernameTipPopover}
                            </div>
                            <div className="footer">
                                <Button bg={isMobile ? '#af189bff' : '#ac2929ff'} _hover={{ bg: isMobile ? '#d45ac4ff' : '#a31f1fff' }} borderRadius={14}
                                    onClick={handleCompleteRegistration} loading={callResponse === 'loading'}
                                >Completa registrazione</Button>
                            </div>
                        </Box>
                    </motion.div>

                </motion.div>
            </MotionDiv>


            <Toaster toaster={toaster}>
                {(toast) => {
                    return (
                        <MotionBox
                            key={toast.id}
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            bg="red.300"
                            color="white"
                            borderRadius={16}
                            px={4}
                            py={3}
                            boxShadow="xl"
                            minW="260px"
                            marginTop={2}
                        >
                            <Text fontWeight="semibold" fontSize="sm" color={'black'}>
                                {toast.title}
                            </Text>

                            {toast.description || ''}
                        </MotionBox>
                    )
                }}
            </Toaster >
        </div>
    )

    async function handleCompleteRegistration() {

        //controlla prima lato client, cosi in caso di body non valido eviti la chiamata al server.

        setCallResponse('loading')
        const response = await completeAuthentication(username, userId)

        if ('error' in response) {
            toaster.create({
                title: (response.error.type === 'network') ? ':/ Errore di Rete' : ':/ Errore di Registrazione',
                description: (
                    <Box color={'darkred'} fontSize="xs" opacity={0.85} mt={1}>
                        {response.error.type === 'network' ? (
                            <Box>Potresti essere offline o il server è in manutenzione, riprova più tardi.
                                <br />Dettagli tecnici dell'errore
                                <br />Messaggio: {response.error.ref.message || 'Sconosciuto'}
                                <br />Codice: {response.error.ref.code || 'Sconosciuto'}
                            </Box>
                        ) : (
                            `Il server dice
${apiErrorTraductions[response.error.ref.data.error as serverAPIErrorCode] || response.error.ref.data.error}`
                        )}
                    </Box>
                )
            })
            setCallResponse(response.error.ref)
            return
        }

        setCallResponse(response)
        const { user: { uuid: userUuid, username: userUsername } } = response.data
        setSecondAuth({ uuid: userUuid, username: userUsername, userId })
        return

    }

}

export default SecondAuth
