import { DialogPromptProvider } from './components/DialogPrompt'
import NavProvider from './components/Nav'
import MainMenu from './menus/MainMenu'
import { VirtualFileProvider } from './components/VirtualFile'

function App() {
  return (
    <>
      <DialogPromptProvider />
      <VirtualFileProvider />
      <NavProvider init={<MainMenu />} />
    </>
  )
}

export default App
