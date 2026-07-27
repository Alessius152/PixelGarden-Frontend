import type { ReactNode } from 'react'
import { Button, Menu, Portal, Text, VStack } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../contexts/DeviceDetectorContext'

type props = {
    trigger: ReactNode,
    isYours: boolean,
    eventHandlers: {
        onWouldEnter: ()=>void
    }
}

function MiniMenu({ trigger, isYours, eventHandlers }: props) {
    const { isResolved, isMobile } = useDeviceDetection()
    const {onWouldEnter} = eventHandlers

    if (!isResolved) {
        return null
    }

    return (
        <Menu.Root>
            <Menu.Trigger asChild>{trigger}</Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content  
                        gap={1} borderRadius={18} paddingInline={4} paddingBlock={4} 
                        bgColor={'#9b6174'} 
                        boxShadow={'-2px 2px 12px 12px #bfbfbf8f'}
                    >
                        <Menu.ItemGroup>
                            <Text color={'#ffaaeb'} fontSize={isMobile ? 'sm' : 'md'}>Azioni</Text>
                        </Menu.ItemGroup>
                        <Menu.Item value="delete-fr" bg={'transparent'} w={'full'} p={0}>
                            <VStack w={'full'} gap={2} paddingBlock={2}>
                                <Button gap={1} w={'full'} borderRadius={12} color={'white'} bgColor={'#770028'}
                                    size={isMobile ? '2xs' : 'xs'} fontSize={isMobile ? '2xs' : 'xs'}
                                    _hover={{ bgColor: '#b9003e' }}
                                    onClick={()=>{ onWouldEnter() }}
                                >Entra</Button>
                                {
                                    isYours ? (
                                        <Button colorPalette='red' gap={1} w={'full'}  size={isMobile ? '2xs' : 'xs'}
                                            borderRadius={12} bgColor={'#fd6f6f'} color={'white'}
                                            fontSize={isMobile ? '2xs' : 'xs'}
                                            _hover={{ bgColor: 'red' }}
                                        >Elimina</Button>
                                    ) : (
                                        <Button colorPalette='red' gap={1} w={'full'}  size={isMobile ? '2xs' : 'xs'}
                                            fontSize={isMobile ? '2xs' : 'xs'} borderRadius={12} bgColor={'#fd6f6f'} color={'white'}
                                            _hover={{ bgColor: 'red' }}
                                        >Abbandona</Button>
                                    )
                                }
                            </VStack>
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    )
}

export default MiniMenu