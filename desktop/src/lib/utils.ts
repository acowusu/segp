import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function synchronized(lock: [boolean, React.Dispatch<React.SetStateAction<boolean>>] , criticalSection: () => void) {
  if (!lock[0]) {
    lock[1](true)
    criticalSection()
    lock[1](false)
  }
}