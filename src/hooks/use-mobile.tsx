
import { useMobile as useMobileContext } from '../context/MobileContext';

export function useIsMobile() {
  const { isMobileView } = useMobileContext();
  return isMobileView;
}

