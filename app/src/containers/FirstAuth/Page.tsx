import './Page.css'

import { Box, Text, Button, VStack, HStack, Image, Dialog, Portal, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { loginWithGithub, loginWithGoogle } from '../../services/firebase/authentication'
import { appRoutes } from '../../utils/objects/objects'

import { useDeviceDetection } from '../../contexts/DeviceDetectorContext'
import { useNavigate } from 'react-router-dom'

import GoogleLogoIcon from '../../assets/icons/google.webp'
import GithubLogoIcon from '../../assets/icons/github.webp'

import DesktopWallpaper from '../../assets/backgrounds/firstAuth/bg-desktop-tablet.webp'
import MobileWallpaper from '../../assets/backgrounds/firstAuth/bg-mobile.webp'
import { MotionBox, MotionButton, MotionHeading } from '../../utils/objects/ui'
import { useState } from 'react'
import type { loginProvider } from '../../utils/types/global'
import type { UserCredential } from 'firebase/auth'

const MotionDiv = motion.div

function Page() {

    const { isResolved, isMobile, isTablet, isDesktop } = useDeviceDetection()
    const navigate = useNavigate()

    const [errModalVis, setErroModalVis] = useState<null | loginProvider>(null)

    const handleLogin = async  (provider: loginProvider) => {
        let result: UserCredential | 'err'

        switch(provider){
            case 'google':
                result = await loginWithGoogle()
                break

            case 'github':
                result = await loginWithGithub()
                break
        }

        if (result !== 'err') {
            navigate(appRoutes.SECOND_AUTH)
        }
        else {
            setErroModalVis(provider)
        }
    }

    const googleButton = (
        <Button
            w="full"
            variant="outline"
            bg="white"
            size={isMobile ? 'md' : 'lg'}
            borderRadius="xl"
            border="1px solid #2d2d2dff"
            _hover={{ bg: 'gray.100' }}
            onClick={async () => handleLogin('google')}
        >
            <HStack>
                <Image src={GoogleLogoIcon} alt="Google" boxSize={isMobile ? '16px' : '24px'} />
                <Text fontWeight="semibold">
                    Accedi con{' '}
                    <Box as="span" color="#4285F4">G</Box>
                    <Box as="span" color="#DB4437">o</Box>
                    <Box as="span" color="#F4B400">o</Box>
                    <Box as="span" color="#4285F4">g</Box>
                    <Box as="span" color="#0F9D58">l</Box>
                    <Box as="span" color="#DB4437">e</Box>
                </Text>
            </HStack>
        </Button>
    )

    const githubButton = (
        <Button
            w="full"
            bg="#2d394bff"
            color="white"
            size={isMobile ? 'md' : 'lg'}
            borderRadius="xl"
            _hover={{ bg: '#142945ff' }}
            onClick={async () => handleLogin('github')}
        >
            <HStack>
                <Image src={GithubLogoIcon} alt="GitHub" boxSize={isMobile ? '16px' : '24px'} />
                <Text fontWeight="semibold">Accedi con GitHub</Text>
            </HStack>
        </Button>
    )

    const bgWallpaper = () => ((isDesktop || isTablet) ? DesktopWallpaper : MobileWallpaper)

    if (!isResolved) {
        return null
    }

    const errorModal = (
        <Dialog.Root open={!!errModalVis}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius={28} p={2} bgColor={'#ffd6f4'}>
                        <Dialog.Header>
                            <Dialog.Title>Errore di registrazione</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body display={'flex'}>
                            <Flex direction={'column'} gap={4}>
                                <Flex alignItems={'center'}>
                                    <Text>
                                        Si è verificato un errore nel tentativo di effettuare l'accesso tramite
                                        <b> {errModalVis}</b>.
                                    </Text>
                                </Flex>
                                <Flex alignItems={'center'} gap={1}>
                                    <Text>Stato connessione:</Text>
                                    {navigator.onLine ? (
                                        <Text color={'magenta'}>sei online</Text>
                                    ) : (
                                        <Text color={'red'}>sei offline</Text>
                                    )}
                                </Flex>
                            </Flex>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button
                                    size={'sm'} variant="plain" colorPalette={'red'} borderRadius={14}
                                    onClick={() => window.close()}
                                >Chiudi app</Button>
                            </Dialog.ActionTrigger>
                            <MotionButton borderRadius={14} size="sm" bgColor="#ce8cc2" color="#ffffff"
                                initial={{ scale: 1 }} whileTap={{ scale: 0.97 }}
                                whileHover={{ scale: 1.03, boxShadow: "0px 6px 14px rgba(0,0,0,0.2)", backgroundColor: "#f27ddc" }}
                                transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
                                onClick={async ()=>{
                                    handleLogin(errModalVis || 'google')
                                    setErroModalVis(null)
                                }}
                            >
                                Riprova
                            </MotionButton>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )

    return (
        <>
            <div
                className="first-auth"
                style={{ backgroundImage: `url('${bgWallpaper()}')` }}
            >
                <MotionDiv
                    className="extend-wrapper"
                    style={{ padding: isMobile ? '8px' : '3rem' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                >
                    <div className="main-wrapper">
                        <motion.div
                            className="content"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <div className="heading-title">
                                <MotionHeading className="gradient-text" fontWeight="bold" as="h1" paddingBlock={8} textAlign="center"
                                    size={isMobile ? '4xl' : '5xl'} initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    Benvenuto in PixelGarden
                                </MotionHeading>
                            </div>

                            <MotionBox
                                className="provider-login-form" textAlign="center" 
                                bg="whiteAlpha.900" borderRadius="2xl" boxShadow="xl" p={8} maxW="420px" w="full"
                                style={{ padding: isMobile ? '18px' : '24px' }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            >
                                <Text mb={6} fontSize={isMobile ? 'xs' : 'md'} color="gray.700">
                                    Per accedere all'app scegli un provider di autenticazione tra i seguenti:
                                </Text>

                                <VStack w="full">
                                    {googleButton}
                                    {githubButton}
                                </VStack>

                                <Text mt={6} fontSize={isMobile ? 'xs' : 'sm'} color="purple.500">
                                    Login protetto | OAuth 2.0
                                </Text>
                            </MotionBox>
                        </motion.div>
                    </div>
                </MotionDiv>
            </div>

            {errorModal}
        </>
    )
}

export default Page
