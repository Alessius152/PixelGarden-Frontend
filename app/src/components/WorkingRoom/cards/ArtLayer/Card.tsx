import { Flex, Text, Icon, HStack, Box, Button } from "@chakra-ui/react"
import { GripVertical, Edit, Eye } from "lucide-react"
import type { ArtLayer } from "../../../../utils/types/arts"
import { useArtEditingContext } from "../../../../contexts/PixelartEditingContext"
import { useCanvasCache, canvasEvents } from "../../../../contexts/CanvasSyncContext" // Importiamo canvasEvents
import { useEffect, useRef } from "react"

function Card({ layer }: { layer: ArtLayer }) {
    const [uuid, name, orderIndex] = layer.metadata
    const { selectedLayerId, setSelectedLayerId } = useArtEditingContext()
    const { getTextureNative } = useCanvasCache()

    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const isSelected = (selectedLayerId ? selectedLayerId[0] : '') === uuid

    useEffect(() => {
        const canvas = previewCanvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const drawPreview = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const imgBitmap = getTextureNative(uuid)
            if (imgBitmap) {
                ctx.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height)
            }
        }

        drawPreview()

        const handleTextureUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<{ layerId: string }>;
            if (customEvent.detail?.layerId === uuid) {
                drawPreview()
            }
        }

        canvasEvents.addEventListener('texture_updated', handleTextureUpdate)
        return () => {
            canvasEvents.removeEventListener('texture_updated', handleTextureUpdate)
        }
    }, [uuid, getTextureNative])

    const handleCardClick = () => {
        if (isSelected) {
            setSelectedLayerId(null)
        } else {
            setSelectedLayerId([uuid, layer.owner[1]])
        }
    }

    return (
        <Flex
            align="center"
            p={2}
            mb={1}
            mx={1}
            borderRadius="md"
            bg={isSelected ? "#fff0f8" : "white"}
            border="1px solid"
            borderColor={isSelected ? "pink.300" : "var(--color-sakura-base)"}
            transition="all 0.2s"
            cursor="pointer"
            role="group"
            _hover={{ bg: "#ffe3f1", borderColor: "pink.200" }}
            minH="50px"
        >
            <Icon
                as={GripVertical}
                color="gray.700"
                mr={1}
                w={3}
                onClick={(e) => e.stopPropagation()}
            />

            <Box
                w="32px"
                h="32px"
                bg="gray.100"
                borderRadius="sm"
                border="1px solid"
                borderColor="gray.200"
                mr={3}
                position="relative"
                overflow="hidden"
                style={{
                    backgroundImage: 'conic-gradient(#eee 90deg, #fff 90deg 180deg, #eee 180deg 270deg, #fff 270deg)',
                    backgroundSize: '8px 8px',
                }}
            >
                <canvas
                    ref={previewCanvasRef}
                    width={32}
                    height={32}
                    style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
                />
            </Box>

            <Flex direction="column" flex={1} overflow="hidden" p={1}
                onClick={handleCardClick}
            >
                <Text fontSize="xs" fontWeight="600" color="var(--color-forest-dark)" truncate>
                    {name || `Livello ${orderIndex}`}
                </Text>
                 <Text fontSize="2xs" fontWeight="400" color="var(--color-wood)" truncate>
                    {layer.owner[0]}
                </Text>
            </Flex>

            <HStack gap={1} opacity={isSelected ? 1 : 0.6} _groupHover={{ opacity: 1 }}>
                <Box color={isSelected ? "pink.500" : "gray.600"} p={1}>
                    <Eye size={14} />
                </Box>

                <Button
                    variant="ghost"
                    size="2xs"
                    aspectRatio={1}
                    _hover={{ color: "pink.500" }}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    <Edit size={14} />
                </Button>
            </HStack>
        </Flex>
    )
}

export default Card;