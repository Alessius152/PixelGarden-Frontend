import { createContext, useContext, type ReactNode } from "react"
import { useMediaQuery } from "@chakra-ui/react"

interface ContextProps {
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean,
}

const ContextContext = createContext<ContextProps>({ isMobile: false, isTablet: false, isDesktop: false })

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, isTablet, isDesktop] = useMediaQuery([
    "(max-width: 620px)",
    "(min-width: 621px) and (max-width: 991px)",
    "(min-width: 992px)",
  ])

  return (
    <ContextContext.Provider value={{ isMobile, isTablet, isDesktop }}>
      {children}
    </ContextContext.Provider>
  )
}

export const useCustomContext = () => useContext(ContextContext)
