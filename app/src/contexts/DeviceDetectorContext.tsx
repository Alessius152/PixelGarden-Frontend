import { createContext, useContext, type ReactNode } from "react"
import { useMediaQuery } from "@chakra-ui/react"

interface DeviceDetectorProps {
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean,

  isResolved: boolean,
}

const DeviceDetectorContext = createContext<DeviceDetectorProps>({ isMobile: false, isTablet: false, isDesktop: false, isResolved: false })

export const DeviceDetectorProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, isTablet, isDesktop] = useMediaQuery([
    "(max-width: 620px)",
    "(min-width: 621px) and (max-width: 991px)",
    "(min-width: 992px)",
  ])
  
  const isResolved = isMobile || isTablet || isDesktop
  
  return (
    <DeviceDetectorContext.Provider value={{ isMobile, isTablet, isDesktop, isResolved }}>
      {children}
    </DeviceDetectorContext.Provider>
  )
}

export const useDeviceDetection = () => useContext(DeviceDetectorContext)
