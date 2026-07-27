import {
    Box,
    ButtonGroup,
    Flex,
    IconButton,
    Pagination,
    Skeleton,
    Spinner,
    Text,
} from "@chakra-ui/react"
import { LucideChevronLeft, LucideChevronRight } from "lucide-react"
import { startTransition, useEffect, useState } from "react"

import { useDeviceDetection } from "../../../../../contexts/DeviceDetectorContext"
import { useFriendsContext } from "../../../../../contexts/FriendsContext"

import FriendCard from "../FriendCard/Card"
import ListLoadingSkeleton from "./subcomponents/FetchingSkeleton/MySkeleton"
import ListFetchingErrorMsgBox from "./subcomponents/ErrorMessageBox/Message"

import "./List.css"

function List() {
    const { isResolved, isMobile } = useDeviceDetection()
    const { friends, fetchNext, totalRecords, uiPageSize, getUiPage, isFetchingNext, isFetching, error, refetch } = useFriendsContext()
    const [page, setPage] = useState(1)

    if (!isResolved) return null

    useEffect(() => {
        fetchNext()
    }, [fetchNext])

    const friendsCounterLoadingSpinner = (
        <Spinner size="xs" color={'magenta'} />
    )

    const fListPaginationButtonsSquareSize = (isMobile ? 36 : 40) - 1

    const friendsPaginatorLoadingSkeleton = error ? <></> : (
        <Flex alignItems="center" gap={2} cursor={'progress'}>
            {[0, 1].map(i => (
                <Skeleton
                    key={i}
                    border="1px solid"
                    css={{
                        borderRadius: '10px',
                        animation: `loading-pag-btn-grp-shine 1.8s linear infinite,loading-pag-btn-grp-border 3.6s ease-in-out infinite`,
                        backgroundImage: `linear-gradient(45deg,#eaf4ff 0%,#f3f8ff 20%,#dde9f5 40%,#f3f8ff 60%,#eaf4ff 80%)`,
                        backgroundSize: '260% 100%',
                    }}
                >
                    <Box
                        w={`${fListPaginationButtonsSquareSize}px`}
                        h={`${fListPaginationButtonsSquareSize}px`}
                    />
                </Skeleton>
            ))}
        </Flex>
    )

    const currentPage = getUiPage(page - 1) ?? []
    const isLoadingTotRecords = totalRecords === 'loading'


    const cards = (() => {
        if ((friends.length === 0) && (isFetching || isFetchingNext)) {
            return <ListLoadingSkeleton />
        }

        if (friends.length > 0) {
            return currentPage.map(e => <FriendCard friendData={e} key={e.friendId} />)
        }

        if (error) {
            return <ListFetchingErrorMsgBox onRetry={() => refetch()} />
        }

        return (
            <Flex alignItems="center" justifyContent="center" padding="20px" direction="column">
                <Text style={{ fontSize: 18, color: '#666', marginBottom: 10 }}>
                    😎 Non hai ancora amici
                </Text>
                <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
                    Inizia a connetterti con altri utenti per vedere la tua lista amici qui.
                </Text>
            </Flex>
        )
    })()

    return (
        <Box display="flex" flexDirection="column" h="full">

            <Box flex={1} overflow="auto" p={4}>
                <Box
                    display="flex"
                    flexWrap={'wrap'}
                    justifyContent={'center'}
                    gap={3}
                >
                    {cards}
                </Box>
            </Box>

            {
                (totalRecords === 0) ? null : (
                    <Box className="s-footer" bg="white" borderTop={error ? 'none' : "1px solid lightgray"} display="flex" alignItems="center" w="full" px={4}>
                        {((!error) && (
                            <Text fontSize={'sm'} color={'#575757'}>I tuoi amici: {isLoadingTotRecords ? friendsCounterLoadingSpinner : totalRecords}</Text>
                        ))}

                        <Box flex={1} display="flex" justifyContent="flex-end">
                            {
                                isLoadingTotRecords ? (
                                    friendsPaginatorLoadingSkeleton
                                ) : (
                                    <Pagination.Root
                                        count={Math.ceil(totalRecords / uiPageSize)}
                                        pageSize={1}
                                        page={page}
                                        onPageChange={({ page }) => {
                                            startTransition(() => setPage(page))
                                            const nextPageItems = getUiPage(page - 1)
                                            if (!isFetchingNext && nextPageItems.length === 0 && friends.length < totalRecords) {
                                                fetchNext()
                                            }
                                        }}
                                    >
                                        <ButtonGroup variant="ghost" size={isMobile ? "sm" : "md"}>
                                            <Pagination.PageText format="short" fontSize="xs" textAlign="right" color="magenta" />

                                            <Pagination.PrevTrigger asChild>
                                                <IconButton aria-label="Pagina precedente">
                                                    <LucideChevronLeft />
                                                </IconButton>
                                            </Pagination.PrevTrigger>

                                            <Pagination.NextTrigger asChild>
                                                <IconButton aria-label="Pagina successiva">
                                                    <LucideChevronRight />
                                                </IconButton>
                                            </Pagination.NextTrigger>
                                        </ButtonGroup>
                                    </Pagination.Root>
                                )
                            }
                        </Box>
                    </Box>
                )
            }

        </Box >
    )
}

export default List
