import { Flex, Text } from "@chakra-ui/react"
import { MotionBox, MotionButton, MotionFlex, MotionText } from "../../../../utils/objects/ui"
import { Edit, Trash2 } from "lucide-react"
import type { singleElementOf_pixelartsListFromBackend } from "../../../../utils/types/rooms"
import { textVariants_pixelartCard } from "../../../../utils/objects/ui/objects"
import { motion } from "framer-motion"
import React, { useState } from "react"
import { useDeviceDetection } from "../../../../contexts/DeviceDetectorContext"

type Props = {
    artData: singleElementOf_pixelartsListFromBackend,
    onArtSelection: (artId: string) => void,
    isMine: boolean
}

function Card({ artData, isMine, onArtSelection }: Props) {
    const { isMobile } = useDeviceDetection()
    const { artId, name, width, height, logicPixelSize: scale } = artData

    const [thinkingToAct, setThinkingToAct] = useState(false)

    const description = (
        <>
            <Flex direction={'column'} flex={isMobile ? 1 : 'auto'}>
                <Flex direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} justifyContent={'space-between'} flexWrap={'wrap'}>
                    <MotionText as={motion.p} fontWeight={'bold'} fontSize={isMobile ? 'xs' : 'md'} truncate variants={textVariants_pixelartCard || {}}>{name}</MotionText>
                    <MotionText as={motion.p} fontWeight={'light'} color={'grey'} fontSize={isMobile ? '8px' : '2xs'} truncate variants={textVariants_pixelartCard || {}}>{`${width}x${height}x${scale}`}</MotionText>
                </Flex>
                <Text flex={isMobile ? 1 : 'auto'} fontWeight={'light'} fontSize={isMobile ? '2xs' : 'xs'} truncate>Descrizione della Pixelart</Text>
            </Flex>
            <Flex alignItems={'center'} justifyContent={isMobile ? 'center' : 'flex-end'} gap={2}
                onMouseOver={() => { setThinkingToAct(true) }}
                onMouseLeave={() => { setThinkingToAct(false) }}
            >
                {isMine && (
                    <>
                        <MotionButton size={'2xs'} fontSize={'2xs'} bgColor={'transparent'} rounded={'lg'}
                            whileHover={{ scale: 1.1, backgroundColor: '#ffb67669', }}
                            onClick={(e) => e.stopPropagation()}
                            transition={{ backgroundColor: { duration: 0.05, ease: "linear" }, scale: { type: "spring", stiffness: 1000, damping: 10 } }}
                        >
                            <Trash2 color="red" />
                        </MotionButton>

                        <MotionButton size={'2xs'} fontSize={'2xs'} bgColor={'transparent'} rounded={'lg'}
                            whileHover={{ scale: 1.1, backgroundColor: '#76a8ff69', }}
                            onClick={(e) => e.stopPropagation()}
                            transition={{ backgroundColor: { duration: 0.05, ease: "linear" }, scale: { type: "spring", stiffness: 1000, damping: 10 } }}
                        >
                            <Edit color="cadetblue" />
                        </MotionButton>
                    </>
                )}
            </Flex>
        </>
    )

    return <MotionFlex direction={isMobile ? 'row' : 'column'} bgColor={'white'} border={'1px solid pink'} rounded={'2xl'}
        w={280} h={isMobile ? 128 : 380} p={isMobile ? 0 : 4} gap={4} cursor={'pointer'} initial="initial" whileHover="hover" whileTap="tap"
        variants={{ tap: (!thinkingToAct) ? { scale: 0.95 } : {}, hover: { scale: 1.05 } }}
        transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.5 }}
        onClick={() => { onArtSelection(artId) }}
    >
        <MotionBox as={motion.div} width={isMobile ? '32' : 'full'} aspectRatio={'1'} rounded={'lg'} border={'1px solid pink'}
            {...(isMobile ? { borderLeft: 0, borderTop: 0, borderBottom: 0 } : null)}
        />
        {isMobile ? (
            <Flex direction={'column'} justifyContent={'space-between'} p={2} paddingLeft={0} {...(isMobile ? { overflow: 'hidden' } : null)}>
                {description}
            </Flex>
        ) : description}
    </MotionFlex>
}

export default React.memo(Card)
