import { Box, Button, Flex, Separator, Text, type ButtonProps } from "@chakra-ui/react"
import { DragScrollContainer } from "../../utils/DragScrollContainer"
import { MotionButton } from "../../../utils/objects/ui" 
import { Eraser, Hand, PaintBucket, Pencil, Redo, Undo } from "lucide-react"
import { type ReactNode } from "react"
import { type HTMLMotionProps } from "framer-motion"
import { useDeviceDetection } from "../../../contexts/DeviceDetectorContext"
import { useArtEditingContext } from "../../../contexts/PixelartEditingContext"
import { DrawingTool } from "../../../utils/enums/artEditing"

type MotionButtonProps = ButtonProps & HTMLMotionProps<"button">

const drawingTools = [DrawingTool.PENCIL, DrawingTool.ERASER, DrawingTool.PAN]

const drawingToolsIcon: Record<DrawingTool, ReactNode> = {
    [DrawingTool.PENCIL]: <Pencil />,
    [DrawingTool.ERASER]: <Eraser />,
    [DrawingTool.PAN]: <Hand />,
}

const toolsGroupBoxProps = {
    direction: 'column' as const,
    gap: 1,
    w: 'full',
    alignItems: 'center',
    maxH: '40%',
    overflowY: 'auto' as const,
    scrollbar: 'hidden',
    h: 'max-content',
}

const toolBtnProps: MotionButtonProps = {
    backgroundColor: 'transparent',
    rounded: 'md',
    aspectRatio: '1',
    color: 'var(--color-forest-light)',
    size: 'sm',
    whileHover: { backgroundColor: "var(--color-sakura-light)", color: 'var(--color-wood)' },
    transition: { type: "tween", duration: 0.12, ease: "easeOut" },
}

const toolsBarHistoryBtnProps: MotionButtonProps = {
    size: 'xs',
    w: 'fit',
    rounded: 'md',
    bgColor: 'transparent',
    color: 'darkgrey',
    whileHover: { backgroundColor: "var(--color-sakura-light)" },
    transition: { type: "tween", duration: 0.12, ease: "easeOut" },
}

function Sidebar() {
    const { isMobile } = useDeviceDetection()
    const { currColor, colorsTable, currTool } = useArtEditingContext()

    // mobile view
    if (isMobile) {
        return (
            <Flex w="full" bg="white" p={3} pb="safe-bottom" borderTop="1px solid var(--color-sakura-base)"
                boxShadow="0 -2px 10px rgba(0,0,0,0.05)" justifyContent="space-around" alignItems="center" zIndex={1000}
            >
                <Button size={'2xs'} rounded="md" bg={currColor.get[1]} border="2px solid white" outline="1px solid rgba(0,0,0,0.1)"
                    onClick={() => { }}
                />
                <Separator orientation="vertical" h="24px" />
                <Flex gap={2}>
                    {drawingTools.map((tool) => {
                        const isCurr = currTool.get === tool
                        return (
                            <MotionButton
                                key={tool}
                                {...toolBtnProps}
                                backgroundColor={isCurr ? 'var(--color-sakura-base) !important' : 'transparent'}
                                color={isCurr ? 'var(--color-wood) !important' : 'var(--color-forest-light)'}
                                border="1px solid"
                                borderColor={isCurr ? 'var(--color-wood)' : 'transparent'}
                                variant={isCurr ? "solid" : "ghost"}
                                onClick={() => currTool.set(tool)}
                            >
                                {drawingToolsIcon[tool]}
                            </MotionButton>
                        )
                    })}
                </Flex>

                <Separator orientation="vertical" h="24px" />

                <Flex gap={2}>
                    <MotionButton size="2xs" variant="ghost" color="darkgrey">
                        <Undo size={12} />
                    </MotionButton>
                    <MotionButton size="2xs" variant="ghost" color="darkgrey">
                        <Redo size={12} />
                    </MotionButton>
                </Flex>
            </Flex>
        )
    }

    // desktop and tablet view
    const drawingToolsBox = (
        <Flex {...toolsGroupBoxProps}>
            <Text fontSize={'2xs'} color={'#6c6c6c'} fontWeight={'bold'}>STRUMENTI</Text>

            <DragScrollContainer props={{}}>
                <Flex flexWrap={'wrap'} gap={1} w={'full'} flex={1} overflowY={'auto'} scrollbar={'hidden'}>
                    {drawingTools.map((tool) => {
                        if (!drawingToolsIcon[tool]) return null
                        const isCurr = currTool.get === tool
                        return (
                            <MotionButton
                                key={tool}
                                {...toolBtnProps}
                                backgroundColor={isCurr ? 'var(--color-sakura-base) !important' : 'transparent'}
                                color={isCurr ? 'var(--color-wood) !important' : 'var(--color-forest-light)'}
                                border="1px solid"
                                borderColor={isCurr ? 'var(--color-wood)' : 'transparent'}
                                variant={isCurr ? "solid" : "ghost"}
                                onClick={() => currTool.set(tool)}
                            >
                                {drawingToolsIcon[tool]}
                            </MotionButton>
                        )
                    })}
                </Flex>
            </DragScrollContainer>
        </Flex>
    )

    const colorsBox = (
        <Flex {...toolsGroupBoxProps} flex={1} maxHeight={320} borderBlock={'1px solid grey'} paddingBlock={1}>
            <Text fontSize={'2xs'} color={'#6c6c6c'} fontWeight={'bold'}>COLORI</Text>
            <Flex direction={'column'} alignItems={'center'}>
                <Box w="32px" aspectRatio={1} p={0} borderRadius="8px" border="1px solid rgba(0,0,0,0.2)" bgColor={currColor.get[1]}
                    onClick={() => {
                        const casualColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
                        colorsTable.add(casualColor)
                    }}
                />
                <Text fontSize={'2xs'} textAlign={'center'} >{currColor.get[1]}</Text>
            </Flex>
            <DragScrollContainer props={{ p: 2, scrollbar: 'hidden' }}>
                <Flex flexWrap={'wrap'} gap={1} w={'full'} justifyContent={'center'}>
                    {colorsTable.get.map((color) => (
                        <MotionButton
                            key={color[0]}
                            w="18px" h="18px" minW="18px" p={0} borderRadius="4px"
                            bg={color[1]} border="1px solid rgba(0,0,0,0.2)"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "tween", duration: 0.1 }}
                            onClick={() => currColor.set(color)}
                        />
                    ))}
                </Flex>
            </DragScrollContainer>
        </Flex>
    )

    return (
        <Flex direction={'column'} h={'full'} justifyContent={'space-between'} p={4} borderRight={'1px solid var(--color-sakura-base)'} userSelect={'none'}>
            <Flex direction={'column'} w={'82px'} alignItems={'center'} h={'full'} overflowY={'auto'} scrollbar={'hidden'}>
                {drawingToolsBox}
                {colorsBox}
            </Flex >

            <Flex direction={'row'} alignItems={'center'} gap={1}>
                <MotionButton {...toolsBarHistoryBtnProps}>
                    <Undo />
                </MotionButton>
                <MotionButton {...toolsBarHistoryBtnProps}>
                    <Redo />
                </MotionButton>
            </Flex>
        </Flex >
    )
}
export default Sidebar