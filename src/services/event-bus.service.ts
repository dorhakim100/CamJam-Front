export const SHOW_MSG = 'show-msg'

export interface UserMsg {
    txt: string
    type: 'success' | 'error'
}



function createEventEmitter() {
    const listenersMap:any = {}
    return {
        on(evName:string, listener:Function) {
            listenersMap[evName] = (listenersMap[evName])? [...listenersMap[evName], listener] : [listener]
            return ()=>{
                listenersMap[evName] = listenersMap[evName].filter((func:Function) => func !== listener)
            }
        },
        emit(evName:string, data:UserMsg) {
            if (!listenersMap[evName]) return
            listenersMap[evName].forEach((listener:Function) => listener(data))
        }
    }
}

export const eventBus = createEventEmitter()

export function showUserMsg(msg:UserMsg): void {
    eventBus.emit(SHOW_MSG, msg)
}

export function showSuccessMsg(txt:string): void {
    const message: UserMsg = {txt, type: 'success'}
    showUserMsg(message)
}
export function showErrorMsg(txt:string):void {
    const message: UserMsg = {txt, type: 'error'}
    showUserMsg(message)
}

declare global {
    interface Window {
      showUserMsg: typeof showUserMsg;
    }
  }

window.showUserMsg = showUserMsg