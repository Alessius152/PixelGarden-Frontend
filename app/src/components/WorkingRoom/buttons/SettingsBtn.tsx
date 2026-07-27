import { Settings, Users } from "lucide-react"
import { MotionButton } from "../../../utils/objects/ui"

function SettingsBtn() {
    return (
        <MotionButton bgColor={'transparent'} color={'var(--color-forest-dark)'}
            whileHover={{ backgroundColor: "var(--color-sakura-light)" }}
            transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
            size={'2xs'} aspectRatio={'1'} p={2} rounded={'md'}
        >
            <Settings />
        </MotionButton>
    );
}

export default SettingsBtn
