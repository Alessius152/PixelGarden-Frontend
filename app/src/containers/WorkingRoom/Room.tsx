import './Room.css'
import { useEffect, useMemo} from 'react'
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react"
import { useNavigate, useParams } from "react-router-dom"

import HeaderTopbar from '../../components/WorkingRoom/HeaderTopbar/Topbar'
import Footer from '../../components/WorkingRoom/Footer/Footer'
import ArtEditingScenario from '../../components/WorkingRoom/scenarios/PixelartEditing/Scenario'
import WorkingLayerViewScenario from '../../components/WorkingRoom/scenarios/WorkingLayerViewScenario/Scenario'

import { useDeviceDetection } from '../../contexts/DeviceDetectorContext'
import { useAppAuth } from '../../contexts/AppAuthContext'
import { useRealtime } from '../../contexts/RealtimeContext'
import type { WorkingRoomScenario } from '../../utils/types/rooms'
import { createContext, useContext } from 'react'
import { ArtEditingProvider } from '../../contexts/PixelartEditingContext'

/*commento importante: qui ho creato un context per via del fatto che la variabile
scenario è utilizzata sia nei componenti appena sottostanti a <Room/>, ma anche un 
pò nei componenti più in profondità.
Quindi faccio una sorta di context-inline (praticamente avvolge solo la room ui)*/
type RoomUIContextType = {
    scenario: WorkingRoomScenario
    setScenario: (newScenario: WorkingRoomScenario) => void
}

const RoomUIContext = createContext<RoomUIContextType | null>(null)

export const useRoomUI = () => {
    const context = useContext(RoomUIContext)
    if (!context) throw new Error("useRoomUI deve essere usato dentro Room")
    return context
}

function Room() {

    const { isTablet, isDesktop } = useDeviceDetection()
    const { isAuthenticated } = useAppAuth()
    const { workingRoom } = useRealtime()
    const { roomId, pixelartId } = useParams()
    const navigate = useNavigate()

    const scenario: WorkingRoomScenario = useMemo(() => {
        if (!workingRoom.details?.isSuccess) return ['unidentified']
        if (pixelartId) return ['pixelart', pixelartId]
        return ['working-layer']
    }, [pixelartId, workingRoom.details?.isSuccess])

    const setScenario = (newScenario: WorkingRoomScenario) => {
        if (newScenario[0] === 'pixelart') {
            navigate(`/workingRoom/${roomId}/${newScenario[1]}`)
        } else {
            navigate(`/workingRoom/${roomId}`)
        }
    }

    useEffect(() => {
        if (!(roomId && isAuthenticated)) return

        workingRoom.join(roomId)
    }, [roomId, isAuthenticated])

    useEffect(() => {
        if (workingRoom.details?.isSuccess && workingRoom.details?.data) {
            if (scenario[0] === 'unidentified') {
                setScenario(['working-layer'])
            }
        }
    }, [workingRoom.details, scenario])

    useEffect(() => {
        if (pixelartId) {
            setScenario(['pixelart', pixelartId])
        } else if (workingRoom.details?.isSuccess) {
            setScenario(['working-layer'])
        }
    }, [pixelartId, workingRoom.details?.isSuccess])

    if (!roomId) return null

    if (workingRoom.details?.isLoading || (scenario[0] === 'unidentified')) {
        return (
            <Flex h="100vh" w="100vw" align="center" justify="center" bg="var(--color-cream)">
                <VStack gap={4}>
                    <Spinner color='var(--color-sakura-base)' size='xl' />
                    <Text fontWeight="bold" color="var(--color-sakura-base)" letterSpacing="widest" fontSize="lg">
                        CARICAMENTO STANZA...
                    </Text>
                </VStack>
            </Flex>
        )
    }

    const currentScenario = (scenario[0] === 'pixelart') ? (
        <ArtEditingProvider artId={scenario[1]}>
            <ArtEditingScenario />
        </ArtEditingProvider>
    ) : (
        <WorkingLayerViewScenario workingLayerId={workingRoom.workingLayer.get || ''} />
    )

    return (
        <RoomUIContext.Provider value={{ scenario, setScenario }}>
            <Flex direction={'column'} h={'full'} justifyContent={'space-between'}>
                <HeaderTopbar
                    roomDetails={{
                        isLoading: !!(workingRoom.details?.isLoading || workingRoom.details?.isError),
                        data: workingRoom.details?.data
                    }}
                />
                {currentScenario}
                {(isTablet || isDesktop) && <Footer />}
            </Flex>
        </RoomUIContext.Provider>
    )
}

export default Room