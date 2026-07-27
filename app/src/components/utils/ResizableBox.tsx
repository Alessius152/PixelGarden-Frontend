import { useEffect, useRef, useState, type ReactNode } from "react"
import { Box } from "@chakra-ui/react"

type Props = {
    initialWidth: number,
    minWidth: number,
    maxWidth: number,
    children: ReactNode,
    side: 'left' | 'right',
}

export function ResizableBox({
    initialWidth = 300,
    minWidth = 200,
    maxWidth = 800,
    children,
    side = "left", // "left" | "right"
}: Props) {
    const [width, setWidth] = useState(initialWidth)
    const isResizing = useRef(false)

    const startResize = () => {
        isResizing.current = true
        document.body.style.userSelect = "none"
    }

    const stopResize = () => {
        isResizing.current = false
        document.body.style.userSelect = ""
    }

    const onMouseMove = (e: any) => {
        if (!isResizing.current) return

        let newWidth

        if (side === "right") {
            newWidth = e.clientX
        } else {
            newWidth = window.innerWidth - e.clientX
        }

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setWidth(newWidth)
        }
    }

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", stopResize)

        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", stopResize)
        }
    }, [])

    const handlePositionStyle =
        side === "right"
            ? { right: 0 }
            : { left: 0 }

    return (
        <Box
            position="relative"
            w={`${width}px`}
            maxW={`${width}px`}
        >
            <Box
                position="absolute"
                top={0}
                {...handlePositionStyle}
                h="100%"
                w="4px"
                cursor="ew-resize"
                onMouseDown={startResize}
            />

            {children}
        </Box>
    )
}