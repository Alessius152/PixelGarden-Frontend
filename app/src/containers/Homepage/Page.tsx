import './Page.css'
import { useDeviceDetection } from '../../contexts/DeviceDetectorContext'

import NavBar from '../../components/Homepage/NavigationBar/Bar'

import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppAuth } from '../../contexts/AppAuthContext'

import { useRealtime } from '../../contexts/RealtimeContext'

function Page() {

    const navigate = useNavigate()
    const { isResolved, isDesktop } = useDeviceDetection()
    const { firstAuth, secondAuth } = useAppAuth()
    const { workingRoom } = useRealtime()

    useEffect(() => {
        if ((firstAuth.status === 'loading') || (secondAuth.status === 'idle') || (secondAuth.status === 'loading')) {
            navigate('/')
            return
        }
    }, [firstAuth.status, secondAuth.status])

    useEffect(() => {
        if (workingRoom.channel) {
            (async () => {
                await workingRoom.leave()
            })()
        }
    }, [])

    if (!(isResolved && (secondAuth.status === 'authenticated'))) {
        return null
    }

    return (
        <div className="homepage" style={{ flexDirection: isDesktop ? 'row' : 'column' }}>
            <div className="navigation-box" style={{ height: isDesktop ? '100%' : 'max-content' }}>
                <NavBar username={secondAuth.user.username} />
            </div>
            <div className="content-box">
                <Outlet />
            </div>
        </div>
    )

}

export default Page