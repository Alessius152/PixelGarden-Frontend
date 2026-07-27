
import { useState, type ReactNode } from 'react'
import { Button, Dialog, Portal } from '@chakra-ui/react'
import { useDeviceDetection } from '../../../../../contexts/DeviceDetectorContext'
import type { friendDataFromBackend } from '../../../../../utils/types/friends'
import friendsApi from '../../../../../api/friends'
import { AxiosError } from 'axios'
import { useFriendsContext } from '../../../../../contexts/FriendsContext'
import { useRoomsContext } from '../../../../../contexts/RoomsContext'
import { snackbarsByAction } from '../../../../../utils/objects/ui/toasterSnackbars'

function Modal(
    { trigger, friend }: {
        trigger: ReactNode,
        friend: friendDataFromBackend
    }
) {

    const { isResolved, isDesktop, isMobile, isTablet } = useDeviceDetection()
    const { methods } = useFriendsContext()
    const { manuallyEdits } = useRoomsContext()

    const [isLoading, setIsLoading] = useState(false)

    console.log("modale renderizzata")

    if (!isResolved) {
        return null
    }

    const handleDelete = async () => {
        setIsLoading(true)
        const response = await friendsApi.cancelFriendship(friend.relationId)
        setIsLoading(false)
        if (response instanceof AxiosError) {
            snackbarsByAction({ isDesktop, isMobile, isTablet }).cancelFriendship.err.network(response)
            return
        }
        if ('error' in response.data) {
            snackbarsByAction({ isDesktop, isMobile, isTablet }).cancelFriendship.err.server(response.data.error)
            return
        }

        const { } = response.data
        methods.removeFriendManually(friend.relationId)
        manuallyEdits.owner.removeExFriendRoomsList(friend.relationId)

    }

    return (
        <Dialog.Root closeOnInteractOutside={false}>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        borderRadius={18} marginInline={isMobile ? 2 : 0}
                    >
                        <Dialog.Header>
                            <Dialog.Title color={'darkred'} fontSize={isMobile ? 'md' : 'lg'} lineHeight={isMobile ? 1 : 2}>Cancellare l'amicizia con <b style={{ color: 'purple' }}>{friend.friend}</b>?</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body
                            minH={175}
                            maxH={175}
                        >
                            Questa è una richiesta di conferma, dopo aver eliminato una persona dalla propria lista di amici, questa esce automaticamente da tutte le tue stanze.
                            <br /> <br />
                            Tuttavia i suoi lavori e contributi non svaniranno nel nulla.
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.CloseTrigger asChild position={'static'}>
                                <Button
                                    size={isMobile ? '2xs' : 'md'}
                                    colorPalette={'gray'} variant={'outline'} borderRadius={16}
                                >Annulla</Button>
                            </Dialog.CloseTrigger>
                            <Button
                                size={isMobile ? '2xs' : 'md'}
                                colorPalette={'red'} variant={'solid'} borderRadius={16}
                                onClick={() => handleDelete()}
                                loading={isLoading}
                            >Conferma</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )

}

export default Modal
