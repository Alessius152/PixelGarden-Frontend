
import { Flex, Text } from "@chakra-ui/react"
import { MotionButton } from "../../../../../utils/objects/ui"

function Message({ error, refetch }: { error: any, refetch: () => void }) {
    return (
        <Flex direction={'column'} h={'fit'} border={'1px solid red'} bgColor={'#ffdfbcff'} p={4} borderRadius={18}>
            <Text fontSize={'lg'} fontWeight={'medium'} color={'#ce1c1cff'}>Si è verificato un errore</Text>
            <Text marginTop={2} color={'red.700'} lineHeight={1.2}>
                Si tratta di un errore di rete, oppure ci deve essere un errore nella richiesta.

                Controlla di aver inserito uno username valido.
            </Text>
            <Flex color={'#830707ff'} alignItems={'center'} gap={1} justifyContent={'flex-end'} paddingBlock={4}>
                <Text>Codice di errore: </Text>
                <Text fontWeight={'bold'}>{error.code || 'Errore sconosciuto'}</Text>
            </Flex>
            <MotionButton
                colorPalette="red"
                variant="solid"
                whileHover={{ scale: 1.075 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                borderRadius={12}
                alignSelf="flex-end"
                onClick={() => {
                    refetch()
                }}
            >
                Riprova
            </MotionButton>
        </Flex>
    )
}

export default Message
