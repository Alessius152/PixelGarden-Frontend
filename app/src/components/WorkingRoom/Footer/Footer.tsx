import { Box } from "@chakra-ui/react"
import Tip from "../../Homepage/RealtimeServiceTip/Tip"
import { useDeviceDetection } from "../../../contexts/DeviceDetectorContext"

function Footer() {
    const {isMobile} = useDeviceDetection()
    return <Box bgColor={'#eee7ff'} p={0} borderTop={isMobile ? 'none' : '1px solid brown'} borderBottom={isMobile ? '1px solid brown' : 'none'}>
        <Box ml={1} w={'fit'}>
            <Tip />
        </Box>
    </Box>

}

export default Footer
