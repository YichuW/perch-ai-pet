import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  test: () => console.log('hello from electron')
})