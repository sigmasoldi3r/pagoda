import { DialogPromptProvider } from './components/DialogPrompt'
import NavProvider from './components/Nav'
import MainMenu from './menus/MainMenu'
import { VirtualFileProvider } from './components/VirtualFile'
import DialogProvider from './components/Dialog'

function App() {
  return (
    <>
      <DialogPromptProvider />
      <DialogProvider />
      <VirtualFileProvider />
      <NavProvider init={<MainMenu />} />
    </>
  )
}

export default App
