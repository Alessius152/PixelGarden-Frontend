import { MotionButton } from "../../../utils/objects/ui"
import { Home, MoveLeft } from "lucide-react"

type Props = {
    handleClick: () => void
}

function TurnWorkingLayersViewBtn({ handleClick }: Props) {

    return (
        <MotionButton bgColor={'transparent'} color={'var(--color-forest-dark)'}
            whileHover={{ backgroundColor: "var(--color-sakura-light)" }}
            transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
            size={'2xs'} aspectRatio={'1'} p={2} rounded={'md'}
            title="Torna alla Homepage"
            onClick={() => {
                handleClick()
            }}
        >
            <MoveLeft />
        </MotionButton>
    )
}

export default TurnWorkingLayersViewBtn
