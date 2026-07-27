import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type {
	CursorPaginatedApiHookOptions,
	CursorType,
	HookSubHooks
} from '../utils/types/hooks/useCursorPaginatedAPI.types'

export function useCursorPaginatedAPI<SingleListObj, ApiSuccessCaseResponse>(
	options: CursorPaginatedApiHookOptions & {
		mapResponseToItems?: (data: ApiSuccessCaseResponse) => SingleListObj[]
	},
	hooks?: HookSubHooks
) {
	type ApiSuccessResponse = ApiSuccessCaseResponse & {
		nextCursor: CursorType
		isTheLastPage: boolean
		totalRecords: number
	}

	type ApiErrorResponse = {
		error: string
	}

	type ApiResponse = ApiSuccessResponse | ApiErrorResponse

	const query = useInfiniteQuery({
		queryKey: options.queryKey,
		initialPageParam: options.initialCursor,
		enabled: options.enabled,
		retry: false,
		queryFn: async ({ pageParam }) => {
			let config: AxiosRequestConfig = {
				params: typeof pageParam === 'object' ? pageParam : { cursor: pageParam }
			}

			if (hooks?.beforeQuery?.setConfig) {
				const modified = await hooks.beforeQuery.setConfig(config)
				if (modified) config = modified
			}

			const response = await axios.get(options.url, config)
			const data: ApiResponse = response.data

			if ('error' in data) throw new Error(data.error)

			return data as ApiSuccessResponse
		},

		getNextPageParam: (lastPage) =>
			lastPage.isTheLastPage ? undefined : lastPage.nextCursor,
	})

	// usa il mapper se fornito, altrimenti assume "result"
	const items = query.data
		? query.data.pages.flatMap(p =>
			options.mapResponseToItems ? options.mapResponseToItems(p) : (p as any).result
		)
		: []

	const totalRecords = (query.data?.pages[0]?.totalRecords ?? 'loading') as 'loading' | number

	return {
		unwrappedLevel: {
			infiniteQueryApiObj: query
		},
		items,
		fetchNext: query.fetchNextPage,
		isLoading: query.isLoading,
		isFetchingNext: query.isFetchingNextPage,
		error: query.error,
		hasMore: query.hasNextPage,
		totalRecords,
		refetch: query.refetch
	}
}
