import { useEffect, useRef } from "react"


export const useEffectUpdate = (callBack:any, dependencies:any) => {

    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        callBack()
    }, dependencies)
}