import { Save } from "lucide-react"
import { MotionButton } from "../../../utils/objects/ui"

type Props = {
    onClick: () => void
}

function SavePixelartBtn({ onClick }: Props) {
    return <MotionButton display="flex" alignItems="center" bgColor="var(--color-sakura-base)" rounded="md" size="2xs" color="var(--color-wood)"
        whileHover={{ backgroundColor: "var(--color-sakura-deep)" }} transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
        fontSize={'xx-small'} aspectRatio={1} title="Salva livello"
        onClick={()=>onClick()}
    >
        <Save />
    </MotionButton>
}

export default SavePixelartBtn
