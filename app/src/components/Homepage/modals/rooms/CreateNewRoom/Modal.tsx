
import { Box, CloseButton, Dialog, Flex, Portal } from "@chakra-ui/react"
import { useState, type ReactNode } from "react"
import { useDeviceDetection } from "../../../../../contexts/DeviceDetectorContext"
import { buttonWithGrandientOnHover, MotionInput, MotionTextarea } from "../../../../../utils/objects/ui"
import { createRoom } from "../../../../../api/rooms"
import { useRoomsContext } from "../../../../../contexts/RoomsContext"
import { serverAPIErrorCode } from "../../../../../utils/enums/apiErrors"
import { snackbarsByAction } from "../../../../../utils/objects/ui/toasterSnackbars"

type props = {
    trigger: ReactNode
}

function Modal({ trigger }: props) {

    const { isResolved, isMobile, isDesktop, isTablet } = useDeviceDetection()
    const { manuallyEdits } = useRoomsContext()

    const [name, setName] = useState('')
    const [description, setDescription] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    if (!isResolved) {
        return null
    }

    const deviceDet = { isMobile, isDesktop, isTablet }

    const handleCreateRoom = async () => {
        if ((name.length < 12) || (name.length > 48)) {
            snackbarsByAction(deviceDet).createNewRoom.err.server(serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_NAME_OUT_OF_LENGTH)
            return
        }
        if (description.length > 380) {
            snackbarsByAction(deviceDet).createNewRoom.err.server(serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_DESCRIPTION_OUT_OF_LENGTH)
            return
        }
        setIsLoading(true)
        const response = await createRoom({ roomData: { name, description: description || null } })
        setIsLoading(false)
        if ('networkError' in response) {
            snackbarsByAction(deviceDet).createNewRoom.err.network(response.networkError)
            return
        }
        if (response.data.error) {
            snackbarsByAction(deviceDet).createNewRoom.err.server(response.data.error)
            return
        }
        
        snackbarsByAction(deviceDet).createNewRoom.success()
        manuallyEdits.owner.addManuallyOwnselfRoom({
            roomId: response.data.roomId,
            name, description,
            members: { total: 1, activeNow: 0 }
        })
    }

    return (
        <Dialog.Root closeOnInteractOutside={false}>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius={18} bgColor={'#fff5f5'} marginInline={isMobile ? 2 : 0}>
                        <Dialog.Header>
                            <Dialog.Title color={'#a1145b'}>Creazione stanza</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body display={'flex'} flexDirection={'column'} alignItems={'center'} paddingBlock={0} paddingInline={4}>

                            <Box
                                display={'flex'} flexDirection={'column'} w={'full'} gap={2} maxH={420} overflow={'auto'} p={2}
                                style={{
                                    '&::WebkitScrollbar': { width: '8px', height: '8px' },
                                    '&::WebkitScrollbarTrack': { background: '#f0e6f2', borderRadius: '8px' },
                                    '&::WebkitScrollbarThumb': { backgroundColor: '#a1145b', borderRadius: '8px', border: '2px solid #f0e6f2' },
                                    '&::WebkitScrollbarThumb:hover': { backgroundColor: '#c2186d' },
                                    scrollbarWidth: 'thin', // Firefox
                                    scrollbarColor: '#a1145b #f0e6f2', // Firefox
                                } as any}
                            >
                                <MotionInput placeholder="Nome della stanza" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }} whileFocus={{ scale: 1.02, backgroundColor: '#aa236786' }}
                                    variant="flushed" bgColor="#ffbdde" border="1px solid #a1145b" paddingInline={3} color="#540069" borderRadius={12}
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                />

                                <MotionTextarea placeholder="Descrizione (facoltativa)" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.05 }} whileFocus={{ scale: 1.02, backgroundColor: '#aa236786' }}
                                    maxH={320} variant="flushed" bgColor="#ffbdde" border="1px solid #a1145b" color="#540069" borderRadius={12} p={3} minH={160}
                                    onChange={(e) => setDescription(e.target.value)}
                                    value={description}
                                />
                            </Box>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Flex alignItems={'center'} justifyContent={'right'}>
                                {buttonWithGrandientOnHover(<></>, 'Crea stanza', {
                                    color: '#fff', fontSize: isMobile ? 'xx-small' : 'sm', p: isMobile ? 0.5 : 2, paddingInline: 4, h: 'fit',
                                    borderRadius: isMobile ? 12 : 16, backgroundColor: '#a1145b',
                                    onClick: () => { handleCreateRoom() },
                                    loading: isLoading
                                }, ["#c70063", "#a54072", "#501533"])}
                            </Flex>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size={'xs'} borderRadius={10} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )

}

export default Modal
