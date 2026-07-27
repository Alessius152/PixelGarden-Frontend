
import { Button } from '@chakra-ui/react'

import './Wrapper.css'
import { mailIcon, telegramIcon } from '../../../../../utils/objects/svgs/icons'

import { buttonWithGrandientOnHover } from '../../../../../utils/objects/ui'
import { PlusIcon } from 'lucide-react'

import ReceivedJoiningInvitesModal from '../../../modals/rooms/ReceivedJoiningInvites/Modal'
import SentJoiningInvitesModal from '../../../modals/rooms/SentJoiningInvites/Modal'
import CreateNewRoomsModal from '../../../modals/rooms/CreateNewRoom/Modal'

function Wrapper() {

    const sentInvitesBtn = (
        <SentJoiningInvitesModal
            trigger={(
                <Button colorPalette={'#d4aecf'} variant={'subtle'} className='rooms-topbar-action-btn secondary'>
                    {telegramIcon}Inviti spediti
                </Button>
            )}
        />
    )

    const receivedInvitesBtn = (
        <ReceivedJoiningInvitesModal
            trigger={(
                <Button colorPalette={'#d4aecf'} variant={'subtle'} className='rooms-topbar-action-btn secondary'>
                    {mailIcon}Inviti ricevuti
                </Button>
            )}
        />
    )

    const newRoomBtn = (
        <CreateNewRoomsModal
            trigger={(
                buttonWithGrandientOnHover(
                    <PlusIcon />,
                    'Nuova stanza',
                    {
                        className: 'rooms-topbar-action-btn',
                        color: '#fff',
                        borderRadius: 12,
                        backgroundColor: '#a1145b'
                    },
                    ["#a1145b","#a54072","#5e2441"]
                )
            )}
        />
    )

    return <>
        {sentInvitesBtn}
        {receivedInvitesBtn}
        {newRoomBtn}
    </>

}

export default Wrapper
