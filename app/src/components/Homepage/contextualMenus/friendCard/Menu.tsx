
import { Menu, Portal, Text } from "@chakra-ui/react"
import type { friendDataFromBackend } from "../../../../utils/types/friends"
import { useDeviceDetection } from "../../../../contexts/DeviceDetectorContext"
import type { ReactNode } from "react"

function CMenu(
    { trigger, friend }: {
        trigger: ReactNode,
        friend: friendDataFromBackend
    }
) {
    const { isResolved, isDesktop, isMobile } = useDeviceDetection()
    const { friend: fUname, friendId } = friend

    if (!isResolved) {
        return null
    }

    return (
        <Menu.Root>
            {isDesktop ? (
                <Menu.ContextTrigger asChild>{trigger}</Menu.ContextTrigger>
            ) : (
                <Menu.Trigger asChild>{trigger}</Menu.Trigger>
            )}
            <Portal>
                <Menu.Positioner>
                    <Menu.Content gap={1} borderRadius={16} paddingInline={8} paddingBlock={4} bgColor={'#e7d3ffff'} >
                        <Menu.ItemGroup>
                            <Text color={'purple'} fontSize={isMobile ? 'xs' : 'lg'}>{fUname}</Text>
                            <Text color={'purple'} fontSize={isMobile ? 'xx-small' : 'sm'}>{friendId}</Text>
                        </Menu.ItemGroup>
                        {/*Non ho ancora implementato eliminazione amicizia <Menu.Item
                            value="delete-fr" bg={'transparent'} w={'full'}
                            closeOnSelect={false}
                        >
                            <VStack w={'full'} >
                                <FriendshipCancelingConfirmModal
                                    friend={friend}
                                    trigger={(
                                        <Button colorPalette='red' gap={1} className='delete-fr-btn' alignSelf={'flex-end'} size={isMobile ? '2xs' : 'xs'}>
                                            {deleteUserIcon} Elimina
                                        </Button>
                                    )}
                                />
                            </VStack>
                        </Menu.Item> */}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    )
}

export default CMenu
