import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkDevice = () => {
       const isMobileDevice = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
       setIsMobile(isMobileDevice);
    }
    
    checkDevice();
    window.addEventListener("resize", checkDevice);
    
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return isMobile
}
