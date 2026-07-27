import { Box, Button, Flex, Heading, Input, Text, Textarea, type BoxProps, type ButtonProps } from "@chakra-ui/react"
import { motion, type MotionProps } from "framer-motion"
import { type ReactNode } from "react"
import { validateUsernamesFirstLetter } from "../functions/dataValidation"

// --- 1. TIPI E COSTANTI ---

export const colorsPerLetter: Record<string, string> = {
    'a': '#FF6B6B', 'b': '#FF8E72', 'c': '#FFD93D', 'd': '#6BCB77', 'e': '#4D96FF',
    'f': '#843BFF', 'g': '#FF5DA2', 'h': '#00C2A8', 'i': '#FF9F1C', 'j': '#2EC4B6',
    'k': '#E71D36', 'l': '#FFBF69', 'm': '#9B5DE5', 'n': '#F15BB5', 'o': '#00BBF9',
    'p': '#00F5D4', 'q': '#FF595E', 'r': '#1982C4', 's': '#6A4C93', 't': '#FFCA3A',
    'u': '#8AC926', 'v': '#1982C4', 'w': '#FF595E', 'x': '#FFCA3A', 'y': '#8AC926',
    'z': '#1982C4', ' ': '#5d5d5dff',
}

interface RGB {
    r: number;
    g: number;
    b: number;
}

// --- 2. LOGICA DEL COLORE E CONTRASTO ---

/** Converte HEX in RGB */
const hexToRgb = (hex: string): RGB => {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return { r, g, b }
}

/** Calcola la luminanza relativa (WCAG) */
const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/** Calcola il rapporto di contrasto tra due colori HEX */
export const getContrastRatio = (hex1: string, hex2: string): number => {
    const rgb1 = hexToRgb(hex1)
    const rgb2 = hexToRgb(hex2)
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
}

export const getContrastColor = (hexColor: string): 'white' | 'black' => {
    if (!hexColor.startsWith('#') || hexColor.length < 7) return 'black'
    const { r, g, b } = hexToRgb(hexColor)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? 'black' : 'white'
}

/** Genera un colore deterministico basato su un indice (Golden Ratio) */
export const generateUserColor = (index: number): string => {
    const goldenRatioConjugate = 0.618033988749895
    let h = (index * goldenRatioConjugate) % 1
    
    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100
        const a = s * Math.min(l, 1 - l) / 100
        const f = (n: number) => {
            const k = (n + h / 30) % 12
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
            return Math.round(255 * color).toString(16).padStart(2, '0')
        }
        return `#${f(0)}${f(8)}${f(4)}`
    }
    return hslToHex(h * 360, 70, 50)
}

// --- 3. LOGICA AVATAR E PLACEHOLDER ---

export const profilePicPlaceholderBgColor = (username: string): string => {
    const firstChar = username?.[0]?.toLowerCase()
    return (firstChar && colorsPerLetter[firstChar]) ? colorsPerLetter[firstChar] : colorsPerLetter[' ']
}

export const buildVoidProfilePicture = (username: string, sizePx: number, otherProps?: BoxProps): ReactNode => {
    const hasValidUsername = username && validateUsernamesFirstLetter(username)
    const baseColor = hasValidUsername ? profilePicPlaceholderBgColor(username) : colorsPerLetter[' ']
    const gradient = `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, ${baseColor} 50%, rgba(0,0,0,0.2) 100%)`

    return (
        <Box
            boxSize={`${sizePx}px`}
            aspectRatio={'1/1'}
            borderRadius="full"
            bg={baseColor}
            backgroundImage={gradient}
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="inset 0 1px 2px rgba(255,255,255,0.3)"
            {...otherProps}
        >
            <Text
                fontSize={`${sizePx * 0.45}px`}
                fontWeight={500}
                lineHeight={1}
                textShadow="0px 1px 2px rgba(0,0,0,0.1)"
            >
                {hasValidUsername ? username[0].toUpperCase() : '?'}
            </Text>
        </Box>
    )
}

// --- 4. COMPONENTI ANIMATI (MOTION) ---

export const MotionBox = motion.create(Box)
export const MotionText = motion.create(Text)
export const MotionButton = motion.create(Button)
export const MotionFlex = motion.create(Flex)
export const MotionInput = motion.create(Input)
export const MotionHeading = motion.create(Heading)
export const MotionTextarea = motion.create(Textarea)

// --- 5. COMPONENTI UI SPECIALI ---

export const buttonWithGrandientOnHover = (
    icon: ReactNode,
    text: string,
    otherProps: ButtonProps & MotionProps,
    gradientColors: string[]
): ReactNode => {
    return (
        <MotionButton
            borderRadius="full"
            _hover={{
                bgGradient: `linear-gradient(90deg, ${gradientColors.join(',')})`,
                color: "white",
                backgroundSize: "600% 600%",
                animation: "friendshipReqSendingBtnOnHover 4s linear infinite",
            }}
            {...otherProps}
        >
            <Flex alignItems={'center'} gap={1} fontSize={otherProps.fontSize}>
                {icon} {text}
            </Flex>
        </MotionButton>
    )
}

export const generatePersistentColor = (userId: string): string => {
    let hash = 0

    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }

    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`
}