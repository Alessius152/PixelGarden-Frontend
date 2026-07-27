import { Button, Dialog, Flex, Portal, Text } from "@chakra-ui/react"
import { closeIcon } from "../../../../utils/objects/svgs/icons"
import { MotionFlex, MotionInput } from "../../../../utils/objects/ui"
import { useDeviceDetection } from "../../../../contexts/DeviceDetectorContext"
import { type Variants } from "framer-motion"
import { useRef, useState, type ReactNode } from "react"
import { useDebounce } from 'use-debounce'

import './Modal.css'

import { useCursorPaginatedAPI } from "../../../../hooks/useCursorPaginatedAPI"
import { SERVER_BASE_URL } from "../../../../utils/objects/constants"
import type { RawAxiosRequestConfig } from "axios"
import { signHttpHeaderWithFirebaseJwtToken } from "../../../../services/firebase/authentication"

import ResultsList from './subcomponents/List/List'
import type { globalUserSearchRecord } from "../../../../utils/types/global"

function Modal(
    { trigger }: {
        trigger: ReactNode
    }
) {

    const { isResolved, isMobile, isDesktop } = useDeviceDetection()

    const [isInputFocused, setIsInputFocused] = useState(false)
    const [username, setUsername] = useState("")

    const [usernameInputValue] = useDebounce(username, 350)

    if (!isResolved) {
        return null
    }

    const inputSmokyVariants: Variants = {
        initial: {
            color: '#4d4d4dfe',
            backgroundImage: `linear-gradient(120deg, rgba(245, 223, 255, 0.85), rgba(254, 206, 255, 0.7), rgba(246, 194, 255, 0.85))`,
            backgroundSize: '400% 400%',
            backgroundPosition: '0% 50%',
            border: 'none'
        },
        animate: {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            transition: {
                duration: 8,
                ease: 'easeInOut',
                repeat: Infinity,
            },
        },
        focused: {
            color: '#4d4d4dfe',
            scale: 1.035,
            backgroundImage: `linear-gradient(120deg, rgba(245, 223, 255, 0.85), rgba(254, 206, 255, 0.7), rgba(246, 194, 255, 0.85))`,
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            border: 'none',
            boxShadow: 'none',
            transition: {
                backgroundPosition: {
                    duration: 8,
                    ease: 'easeInOut',
                    repeat: Infinity,
                },
                scale: { duration: 0.2 },
            },
        },
    }

    const addFriendModalObjects = {
        usernameInput: (
            <MotionInput
                placeholder="Inserisci uno username" _placeholder={{ color: '#4f4f4ffe' }}
                w={isMobile ? 'full' : 340} p={5} borderRadius={12}
                borderColor="transparent" variants={inputSmokyVariants} initial="initial"
                animate={isInputFocused ? 'focused' : 'animate'}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => {
                    const v = e.target.value
                    setUsername(v)
                }}
                defaultValue={""}
            />
        )
    }

    const beforeQueryFilteredUserFetching = async (config: RawAxiosRequestConfig) => {
        if (!config.headers) { config.headers = {} }
        if (!config.params) { config.params = {} }
        config.params['query'] = usernameInputValue
        await signHttpHeaderWithFirebaseJwtToken(config.headers)
        return config
    }

    const { items, totalRecords, fetchNext, isLoading, error, hasMore, isFetchingNext, refetch } = useCursorPaginatedAPI<globalUserSearchRecord, { firsts: Array<globalUserSearchRecord> }>({
        url: `${SERVER_BASE_URL}/search/filteredUsers`,
        initialCursor: '0',
        queryKey: ['filteredGlobalUsersSearch', usernameInputValue],
        enabled: !!usernameInputValue,
        mapResponseToItems: (data) => data.firsts
    }, {
        beforeQuery: { setConfig: beforeQueryFilteredUserFetching }
    })

    const scrollContainerRef = useRef<HTMLDivElement | null>(null)

    const hasNoStartedWriting = (usernameInputValue.trim() === '')

    return (
        <Dialog.Root closeOnInteractOutside={false}>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner overflow={'hidden'} paddingInline={isMobile ? 2 : 0}>
                    <Dialog.Content marginInline={(!isDesktop) ? 3 : 0} borderRadius={18}>
                        <Dialog.Header>
                            <Flex gap={0} direction={'column'} w={'full'}>
                                <Dialog.Title fontSize={isMobile ? 'md' : 'sm'} m={0} p={0} fontWeight={'medium'} color={'purple'} textAlign={isMobile ? 'center' : 'left'}>Ricerca globale utente</Dialog.Title>
                                {addFriendModalObjects.usernameInput}
                            </Flex>
                        </Dialog.Header>
                        <Dialog.Body
                            ref={scrollContainerRef}
                            minH={360}
                            maxH={360}
                            border={'1px solid lightgray'}
                            m={2}
                            borderRadius={18}
                            p={isMobile ? 2 : 4}
                            overflow={'auto'}
                            display={hasNoStartedWriting ? 'block' : 'flex'}
                            overflowX={'hidden'}
                        >
                            <ResultsList
                                hasNoStartedWriting={hasNoStartedWriting}
                                isLoading={isLoading} error={error} items={items}
                                fetchNext={fetchNext} hasMore={hasMore}
                                isFetchingNext={isFetchingNext}
                                refetch={refetch}
                            />
                        </Dialog.Body>
                        <Dialog.Footer p={true ? 'auto' : 0}>
                            {true && (
                                <MotionFlex w="full" alignItems="center" justifyContent="space-between" overflow="hidden"
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                >
                                    {
                                        (usernameInputValue && (!error)) ? (
                                            <Flex color="purple" gap={1}>
                                                <Text>Risultati:</Text>
                                                <Text fontWeight="bold">{totalRecords}</Text>
                                            </Flex>
                                        ) : <></>
                                    }
                                </MotionFlex>
                            )}
                        </Dialog.Footer>
                        {
                            (!isMobile) && (
                                <Dialog.CloseTrigger asChild>
                                    <Button p={0} colorPalette={'pink'} variant={'ghost'} borderRadius={12}>{closeIcon}</Button>
                                </Dialog.CloseTrigger>
                            )
                        }
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default Modal
