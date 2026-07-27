
import { Button } from '@chakra-ui/react'

import './Wrapper.css'
import { addUserIcon, mailIcon, telegramIcon } from '../../../../../utils/objects/svgs/icons'

import AddFriendSearchModal from '../../../modals/GlobalUserSearch/Modal'
import ReceivedFriendshipRequestsModal from '../../../modals/ReceivedFriendshipRequests/Modal'
import SendedFriendshipRequestsModal from '../../../modals/SendedFriendshipRequests/Modal'

function Wrapper() {

    const addFriendModal = <AddFriendSearchModal
        trigger={<Button colorPalette={'pink'} className='friends-topbar-action-btn' >{addUserIcon} Aggiungi amico</Button>}
    />

    const receivedRequestsModal = <ReceivedFriendshipRequestsModal
        trigger={
            <Button colorPalette={'purple'} variant={'subtle'} className='friends-topbar-action-btn secondary'>
                {mailIcon}Richieste ricevute
            </Button>
        }
    />

    const sendedRequestsModal = <SendedFriendshipRequestsModal
        trigger={
            <Button
                colorPalette={'purple'} variant={'subtle'} className='friends-topbar-action-btn secondary'
            >{telegramIcon}Richieste inviate</Button>
        }
    />

    const friendsActionsButtons = (
        <>
            {sendedRequestsModal}
            {receivedRequestsModal}
            {addFriendModal}
        </>
    )

    return friendsActionsButtons
}

export default Wrapper
