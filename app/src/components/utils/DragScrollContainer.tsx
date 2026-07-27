import React, { useRef, useState } from "react"
import { Box, type BoxProps } from "@chakra-ui/react"

type Props = {
    children: React.ReactNode
    props?: BoxProps
    height?: string | number
}

export function DragScrollContainer({ props, children, height = "100%" }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    const [isDown, setIsDown] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startY, setStartY] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)

    const handleMouseDown = (e: React.MouseEvent) => {
        const el = ref.current
        if (!el) return

        const rect = el.getBoundingClientRect()

        setIsDown(true)
        setStartX(e.clientX - rect.left)
        setStartY(e.clientY - rect.top)

        setScrollLeft(el.scrollLeft)
        setScrollTop(el.scrollTop)
    }

    const handleMouseUp = () => setIsDown(false)
    const handleMouseLeave = () => setIsDown(false)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown) return
        const el = ref.current
        if (!el) return

        e.preventDefault()

        const rect = el.getBoundingClientRect()

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const walkX = x - startX
        const walkY = y - startY

        el.scrollLeft = scrollLeft - walkX
        el.scrollTop = scrollTop - walkY
    }

    return (
        <Box
            ref={ref}
            h={height}
            overflow="auto"
            userSelect={'none'}
            cursor={isDown ? "grabbing" : "grab"}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            {...props}
        >
            {children}
        </Box>
    )
}