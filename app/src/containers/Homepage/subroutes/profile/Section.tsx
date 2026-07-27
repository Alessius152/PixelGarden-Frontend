import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react"
import { useAppAuth } from "../../../../contexts/AppAuthContext"
import { logout } from "../../../../services/firebase/authentication"

function Section() {

    const { firstAuth, secondAuth } = useAppAuth()

    if ((firstAuth.status !== 'authenticated') || (secondAuth.status !== 'authenticated')) {
        return null
    }

    const providerLabels = {
        'google.com': 'Google',
        'github.com': 'Github'
    }

    const provider = firstAuth.user.providerData[0]

    return <Box display={'flex'} flexDirection={'column'} h={'fit'} justifyContent={'flex-start'}>
        <Heading h={'fit'} padding={2} color={'purple'} size={'2xl'}>Benvenuto nella tua area profilo</Heading>
        <Box flex={1} paddingInline={4}>
            <Flex alignItems={'center'} gap={2}>
                <Text fontWeight={'600'}>Account {providerLabels[provider.providerId as keyof typeof providerLabels]}</Text>
                <Flex alignItems={'center'} gap={1}>
                    <Text fontSize={'md'}>{'['}</Text>
                    <Text fontSize={'sm'}>{provider.email}</Text>
                    <Text fontSize={'md'}>{']'}</Text>
                </Flex>
            </Flex>

            <Flex alignItems={'center'} gap={2}>
                <Text fontWeight={'600'}>Il tuo account ID univoco globale</Text>
                <Flex alignItems={'center'} gap={1}>
                    <Text fontSize={'md'}>{'['}</Text>
                    <Text fontSize={'sm'}>{secondAuth.user.uuid}</Text>
                    <Text fontSize={'md'}>{']'}</Text>
                </Flex>
            </Flex>

            <Flex alignItems={'center'} gap={2}>
                <Text fontWeight={'600'}>Il tuo account user ID, anche detto @</Text>
                <Flex alignItems={'center'} gap={1}>
                    <Text fontSize={'md'}>{'['}</Text>
                    <Text fontSize={'sm'}>{secondAuth.user.userId}</Text>
                    <Text fontSize={'md'}>{']'}</Text>
                </Flex>
            </Flex>
        </Box>
        <Box p={2}>
            <Button
                colorPalette={'red'}
                borderRadius={16}
                onClick={() => { logout() }}
            >Logout</Button>
        </Box>
    </Box>

}

export default Section
