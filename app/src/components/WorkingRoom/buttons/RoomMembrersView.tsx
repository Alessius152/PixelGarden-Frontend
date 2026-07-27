import { Users } from "lucide-react"
import { MotionButton } from "../../../utils/objects/ui"
import MyDrawer from "../drawers/RoomMembers/MyDrawer"

function RoomMembersBtn() {
    return (
        <MyDrawer
            trigger={
                <MotionButton display="flex" alignItems="center" gap={2} bgColor="var(--color-sakura-light)" fontWeight="bold" rounded="lg" size="xs"
                    color="var(--color-wood)" whileHover={{ backgroundColor: "var(--color-sakura-base)" }}
                    transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
                >
                    <Users />
                    Membri stanza
                </MotionButton>
            }
        />
    )
}

export default RoomMembersBtn
