import type { ReactNode } from "react"
import { useDeviceDetection } from "../../../../../contexts/DeviceDetectorContext"
import { Button, Menu, Portal } from "@chakra-ui/react"

import FriendsActionButtonsWrapper from '../RoomsActionsButtonsWrapper/Wrapper'
import { otherIcon } from "../../../../../utils/objects/svgs/icons"

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

    const mobileOtherBtn = isMobile ? (
        <Button background={'linear-gradient(to bottom right, #740b33, #bb1600);'}
            p={0} borderRadius={12} color="white" display="flex" alignItems="center" justifyContent="center"
        >
            {otherIcon}
        </Button>
    ) : null

    return mobileOtherBtnContextualMenu(mobileOtherBtn)

}

export default MiniMenu
