import './Bar.css'
import './locationButton.css'

import {
    Box,
    VStack,
    Text,
    Button,
    Drawer,
    Portal,
    CloseButton,
    Link as ChakraLink,
} from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'

import { useDeviceDetection } from '../../../contexts/DeviceDetectorContext'
import { useState } from 'react'
import { MotionButton } from '../../../utils/objects/ui'
import { useRealtime } from '../../../contexts/RealtimeContext'
import RealtimeServiceTip from '../RealtimeServiceTip/Tip'

function Bar(
    { username }: {
        username: string
    }
) {

    const { isDesktop, isResolved } = useDeviceDetection()

    //questo è riservato al drawer top-down da mobile
    const [isDrawerOpened, setIsDrawerOpened] = useState<boolean>(false)

    if (!isResolved) {
        return null
    }

    const usernameLabel = (
        <Text fontSize={'x-large'} style={{ fontSize: '22px' }} className='navbar-decorative-username'>
            {username}
        </Text>
    )

    const bellIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
    )

    const notificationsButton = (() => {
        if (isDesktop) {
            return (
                <MotionButton
                    w={10} h={10} borderRadius={12} bgColor="#c94da5" boxShadow="2px 2px 6px 1px black"
                    whileHover={{ scale: 1.1, backgroundColor: "#d86ebd", boxShadow: "none" }}
                    transition={{ duration: 0.02, ease: "easeOut" }}
                >{bellIcon}</MotionButton>
            )
        }
        return (
            <MotionButton
                w={10} h={10} borderRadius={12} bgColor="#c94da5"
                whileTap={{ scale: 1.1, backgroundColor: "#d86ebd" }}
                transition={{ duration: 0.02, ease: "easeOut" }}
            >{bellIcon}</MotionButton>
        )
    })()

    const mobileMenuIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
        </svg>
    )

    const locationBtnClass = (isActive: boolean) => [
        "location-btn",
        isActive ? "active-btn" : "non-active-btn",
    ].join(" ")

    const { client } = useRealtime()

    /*
    questa animazione viene applicata di default quando sono su mobile o tablet, se sono su desktop
    si fa solo all'hover
    */
    const locationBtnInitialAnim = (!isDesktop) ? ('magentaFlow 3s ease infinite') : undefined

    const locationButtons = (
        <>
            <NavLink to="rooms" className={({ isActive }) => `${locationBtnClass(isActive)} rooms-loc`}>
                <Button onClick={handleLocationChoice} animation={locationBtnInitialAnim}>Gestione stanze</Button>
            </NavLink>
            <NavLink to="friends" className={({ isActive }) => locationBtnClass(isActive)}>
                <Button onClick={handleLocationChoice} animation={locationBtnInitialAnim}>I tuoi amici</Button>
            </NavLink>
            <NavLink to="profile" className={({ isActive }) => locationBtnClass(isActive)}>
                <Button onClick={handleLocationChoice} animation={locationBtnInitialAnim}>Il tuo profilo</Button>
            </NavLink>
        </>
    )

    const navbarFooter = (
        <>
            <div className="left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text textStyle={'xs'} color={'gray'} fontStyle={'italic'} fontSize={isDesktop ? 12 : 10}
                >Versione: <span style={{ color: 'darkcyan' }}>DEMO</span></Text>
                <ChakraLink fontSize={'x-small'} color={'darkred'}>Segnala un bug</ChakraLink>
                <RealtimeServiceTip/>
            </div>
            {
                isDesktop && (
                    <div className="right">
                        {notificationsButton}
                    </div>
                )
            }
        </>
    )

    if (isDesktop) {
        return (
            <VStack className="desktop-sb" gap={0}>
                <Box className="header">
                    {usernameLabel}
                </Box>
                <Box className="content">
                    {locationButtons}
                </Box>
                <Box className="footer">{navbarFooter}</Box>
            </VStack>
        )
    }

    return (
        <>
            <div className="mobile-topbar">
                <div className="left-part">
                    <Button w={10} h={10} p={1} variant={'ghost'} onClick={() => { setIsDrawerOpened(true) }}>
                        {mobileMenuIcon}
                    </Button>
                    <div className="thin-uname-wrapper">
                        <Text fontSize={'md'} fontWeight={600} color="#4a1f3c">Bentornato, {username}</Text>
                    </div>
                </div>
                <div className="right-part">
                    {notificationsButton}
                </div>
            </div>

            <Drawer.Root placement={'top'} open={isDrawerOpened}>
                <Portal >
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content className='mobile-top-drawer' roundedBottom={'l3'}>
                            <Drawer.Header className='header'>
                                {usernameLabel}
                                <Drawer.CloseTrigger asChild className='close-trigger'>
                                    <CloseButton size="xs" onClick={() => { setIsDrawerOpened(false) }} />
                                </Drawer.CloseTrigger>
                            </Drawer.Header>

                            <Drawer.Body className='body'>
                                <div className="location-btns">
                                    {locationButtons}
                                </div>
                            </Drawer.Body>

                            <Drawer.Footer className='footer'>
                                {navbarFooter}
                            </Drawer.Footer>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </>
    )

    function handleLocationChoice() {
        if (isDrawerOpened) {
            setIsDrawerOpened(false)
        }
    }

}

export default Bar 