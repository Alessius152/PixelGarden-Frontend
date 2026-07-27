

import { Menu, Button, Portal } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../../contexts/DeviceDetectorContext'
import { otherIcon } from '../../../../../utils/objects/svgs/icons'
import type { ReactNode } from 'react'

import FriendsActionButtonsWrapper from '../FriendsActionButtonsWrapper/Wrapper'

function MiniMenu() {

    const { isResolved, isMobile } = useDeviceDetection()

    if (!isResolved) {
        return null
    }

    const mobileOtherBtnContextualMenu = (trigger: ReactNode) => isMobile ? (
        <Menu.Root>
            <Menu.Trigger asChild>
                {trigger}
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content display={'flex'} flexDirection={'column'} gap={1} borderRadius={12}>
                        <FriendsActionButtonsWrapper />
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    ) : null

    /*
        spiego questo bottone:
        su desktop ho i bottoni "richieste ricevute", "richieste inviate" e "aggiungi amico",
        su mobile non ho lo spazio necessario per inserirli senza ingombrare troppo la ui.
        Al click di questo tasto si apre un piccolissimo menu contestuale con le 3 azioni
        appena citate.
        */
    const mobileOtherBtn = isMobile ? (
        <Button background={'linear-gradient(to bottom right, #0891b2, #9ca3af);'}
            p={0} borderRadius={12} color="white" display="flex" alignItems="center" justifyContent="center"
        >
            {otherIcon}
        </Button>
    ) : null

    return mobileOtherBtnContextualMenu(mobileOtherBtn)
}

export default MiniMenu
