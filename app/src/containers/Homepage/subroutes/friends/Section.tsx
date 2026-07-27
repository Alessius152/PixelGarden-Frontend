
import './Section.css'
import {
    Box,
    Skeleton,
} from '@chakra-ui/react'

import { useDeviceDetection } from '../../../../contexts/DeviceDetectorContext'

import FriendsActionButtonsWrapper from '../../../../components/Homepage/subroutes/friends/FriendsActionButtonsWrapper/Wrapper'
import FriendsList from '../../../../components/Homepage/subroutes/friends/FriendsList/List'
import MobileOtherActionsMenu from '../../../../components/Homepage/subroutes/friends/MobileOtherActionsMenu/Menu'
import { MotionInput } from '../../../../utils/objects/ui'
import { useFriendsContext } from '../../../../contexts/FriendsContext'

function Section() {

    const { isMobile, isDesktop, isTablet, isResolved } = useDeviceDetection()
    const { totalRecords, error } = useFriendsContext()

    const isLoadingInitial = totalRecords === 'loading'
    const hasNoFriends = ((!isLoadingInitial) && (totalRecords === 0))

    if (!isResolved) {
        return null
    }

    const friendSearchInput = true ? null : error ? <div></div> : (
        isLoadingInitial ? (
            <Skeleton w={isMobile ? 'full' : 340} p={5} />
        ) : (
            (totalRecords === 0) ? null : (
                <MotionInput
                    placeholder="Cerca un amico" _placeholder={{ color: 'black' }}
                    _selection={{ bgColor: '#98289839' }}
                    color='purple' w={isMobile ? 'full' : 340} p={5} variant="subtle"
                    borderRadius="10px" borderWidth={0} outline={'none'}
                    initial={{ opacity: 0.9, backgroundColor: '#cdcdcdff' }}
                    whileFocus={{ scale: 1.02, backgroundColor: '#c7c7c7ff' }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                />
            )
        )
    )

    const mainBoxHeaderContent = (
        (isDesktop || isTablet) ? (
            <>
                {friendSearchInput}
                <div className="right">
                    <FriendsActionButtonsWrapper />
                </div>
            </>
        ) : (
            <Box display={'flex'} alignItems={'center'} w={'full'} gap={1.5}>
                <Box flex={1}>
                    {friendSearchInput}
                </Box>
                <MobileOtherActionsMenu />
            </Box>
        )
    )
    return (
        <>
            <Box
                className="friends-section"
            >
                <Box className="s-header" flexDirection={isMobile ? 'column' : 'row'} gap={2} bgColor={'#ffffffff'} borderBottom={'1px solid lightgray'} justifyContent={hasNoFriends ? 'right' : 'right'}>
                    {mainBoxHeaderContent}
                </Box >
                <div className="s-content">
                    <div className="list" style={{ overflow: 'auto' }}>
                        <FriendsList />
                    </div>
                </div>
            </Box>
        </>
    )

}

export default Section 