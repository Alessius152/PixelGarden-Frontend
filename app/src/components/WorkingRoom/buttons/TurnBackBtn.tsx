import { useNavigate } from "react-router-dom"
import { MotionButton } from "../../../utils/objects/ui"
import { appRoutes } from "../../../utils/objects/objects"
import { Home } from "lucide-react"

function TurnHomeBtn() {
    
    const navigate = useNavigate()

    return (
        <MotionButton bgColor={'transparent'} color={'var(--color-forest-dark)'}
            whileHover={{ backgroundColor: "var(--color-sakura-light)" }}
            transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
            size={'2xs'} aspectRatio={'1'} p={2} rounded={'md'}
            onClick={() => {
                navigate(appRoutes.HOMEPAGE.ROOMS)
            }}
        >
            <Home />
        </MotionButton>
    )
}

export default TurnHomeBtn
