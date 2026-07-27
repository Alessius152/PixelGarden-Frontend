
import { Flex, Menu, Portal } from "@chakra-ui/react"
import type { ReactNode } from "react"
import SavePixelartBtn from "../../buttons/SavePixelartBtn"
import RoomMembersBtn from "../../buttons/RoomMembrersView"
import SettingsBtn from "../../buttons/SettingsBtn"
import TurnBackBtn from "../../buttons/TurnBackBtn"
import { useRoomUI } from "../../../../containers/WorkingRoom/Room"
import ArtCollaboratorsBtn from "../../buttons/ArtCollaborators"

type Props = {
    trigger: ReactNode
}

function MiniMenu({ trigger }: Props) {


    const { scenario } = useRoomUI()

    return <Menu.Root>
        <Menu.Trigger asChild>{trigger}</Menu.Trigger>
        <Portal>
            <Menu.Positioner>
                <Menu.Content gap={3} borderRadius={16} p={4} bgColor={'#dcb5ff'}>

                    <Flex direction={'column'} gap={4}>
                        <Flex direction={'column'} gap={2}>
                            <RoomMembersBtn />
                            {(scenario[0] === 'pixelart') && <ArtCollaboratorsBtn/>}
                            <SavePixelartBtn />
                        </Flex>
                        <Flex alignContent={'center'} justifyContent={'center'} gap={8}>
                            <SettingsBtn />
                            <TurnBackBtn />
                        </Flex>
                    </Flex>

                </Menu.Content>
            </Menu.Positioner>
        </Portal>
    </Menu.Root>
}

export default MiniMenu
