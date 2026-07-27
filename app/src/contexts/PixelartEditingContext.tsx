import { createContext, useContext, useState, type ReactNode } from "react"
import type { ColorsToolElement } from "../utils/types/artEditing"
import { DrawingTool } from "../utils/enums/artEditing"
import type { ArtLayersResponse } from "../utils/types/arts"
import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from "@tanstack/react-query"
import { signHttpHeaderWithFirebaseJwtToken } from "../services/firebase/authentication"
import { SERVER_BASE_URL } from "../utils/objects/constants"
import axios from "axios"

interface ArtEditingProps {
    colorsTable: {
        get: Array<ColorsToolElement>,
        add: (hex: string) => void,
    },
    currColor: {
        get: ColorsToolElement,
        set: React.Dispatch<React.SetStateAction<ColorsToolElement>>
    },
    currTool: {
        get: DrawingTool,
        set: React.Dispatch<React.SetStateAction<DrawingTool>>
    },
    artLayersQuery: UseInfiniteQueryResult<InfiniteData<ArtLayersResponse, unknown>, Error>,

    selectedLayerId: [string, string] | null;
    setSelectedLayerId: React.Dispatch<React.SetStateAction<[string, string] | null>>;

    getCurrentArtLayersEditingToken: ()=>string | null,
}

const ArtEditingContext = createContext<ArtEditingProps | undefined>(undefined)

export const ArtEditingProvider = ({ children, artId }: { children: ReactNode, artId: string }) => {

    const [colorsTable, setColorsTable] = useState<Array<ColorsToolElement>>([
        [1, '#000000'], [2, '#808080'], [3, '#800000'], [4, '#FF0000'],
        [5, '#808000'], [6, '#FFFF00'], [7, '#008000'], [8, '#00FF00'],
        [9, '#008080'], [10, '#00FFFF'], [11, '#000080'], [12, '#0000FF'],
        [13, '#800080'], [14, '#FF00FF'], [15, '#C0C0C0'], [16, '#FFFFFF'],
        [17, '#FFA500'], [18, '#A52A2A'], [19, '#8B4513'], [20, '#2E8B57'],
        [21, '#4682B4'], [22, '#D2691E'], [23, '#DC143C'], [24, '#ADFF2F'],
        [25, '#7FFF00'], [26, '#00CED1'], [27, '#1E90FF'], [28, '#FF1493'],
        [29, '#FF69B4'], [30, '#B22222'], [31, '#DAA520'], [32, '#4B0082']
    ])
    
    const artLayers = useInfiniteQuery<ArtLayersResponse>({
        queryKey: ['artLayersList', artId],
        queryFn: async ({ pageParam = -1 }) => {
            const headers = {}
            await signHttpHeaderWithFirebaseJwtToken(headers)
            const res = await axios.get<ArtLayersResponse>(
                `${SERVER_BASE_URL}/arts/getLayersList`,
                { params: { artId, cursor: pageParam }, headers }
            )
            return res.data
        },
        initialPageParam: -1,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
    })

    const getCurrentArtLayersEditingToken = ()=>{
        const firstPage = artLayers.data?.pages[0]
        return firstPage ? firstPage?.layersEditingToken : null
    }

    const [currColor, setCurrColor] = useState<ColorsToolElement>(colorsTable[0])
    const [currTool, setCurrTool] = useState<DrawingTool>(DrawingTool.PENCIL)

    //0 uuid, 1 owner at
    const [selectedLayerId, setSelectedLayerId] = useState<[string, string] | null>(null)

    return (
        <ArtEditingContext.Provider value={{
            colorsTable: {
                get: colorsTable,
                add: (hex) => {
                    const lastId = colorsTable[colorsTable.length - 1][0]
                    setColorsTable(prev => [...prev, [lastId + 1, hex]])
                }
            },
            currColor: {
                get: currColor,
                set: setCurrColor
            },
            currTool: {
                get: currTool,
                set: setCurrTool
            },
            artLayersQuery: artLayers,

            selectedLayerId,
            setSelectedLayerId,

            getCurrentArtLayersEditingToken,
        }}>
            {children}
        </ArtEditingContext.Provider>
    )
}

export const useArtEditingContext = () => {
    const context = useContext(ArtEditingContext)
    if (!context) {
        throw new Error('useArtEditingContext must be used inside ArtEditingProvider')
    }
    return context
}