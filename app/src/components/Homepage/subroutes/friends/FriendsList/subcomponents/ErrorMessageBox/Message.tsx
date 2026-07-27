import { Button, Text } from "@chakra-ui/react"
import { useDeviceDetection } from "../../../../../../../contexts/DeviceDetectorContext"
import { MotionBox } from "../../../../../../../utils/objects/ui"
import { AnimatePresence } from "framer-motion"
import { useState } from "react"

type Props = {
    onRetry: () => void
}

function Message({ onRetry }: Props) {
    const { isResolved, isMobile } = useDeviceDetection()
    const [isVisible, setIsVisible] = useState(true)

    if (!isResolved) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <MotionBox
                    w="full"
                    p={4}
                    bg="purple.100"
                    borderRadius={12}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                >
                    <Text fontSize={isMobile ? 'lg' : 'xl'} fontWeight="medium" mb={2} textAlign="center">
                        Errore nel caricamento
                    </Text>

                    <Text fontSize="sm" mb={4} textAlign="center">
                        Si è verificato un errore durante il download della lista di amici.
                    </Text>

                    <Button
                        size="sm"
                        onClick={() => {
                            setIsVisible(false)
                            onRetry()
                        }}
                    >
                        Riprova
                    </Button>
                </MotionBox>
            )}
        </AnimatePresence>
    )
}

export default Message