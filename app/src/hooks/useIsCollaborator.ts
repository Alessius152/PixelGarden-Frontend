import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import type { pixelartCollaboratorsListFromBackend } from "../utils/types/arts"
import type { AxiosError } from "axios"

export function useIsCollaborator(artId: string, userId: string) {
    const { data } = useQuery<pixelartCollaboratorsListFromBackend, AxiosError>({
        queryKey: ['pixelartCollaboratorsList', artId],
        enabled: false,
        queryFn: () => Promise.resolve(null as any),
    })

    return useMemo(() => {
        if (!data) return false
        return data.collaborators.some(c => c[0] === userId)
    }, [data, userId])
}
