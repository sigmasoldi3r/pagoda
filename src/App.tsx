import { DialogPromptProvider } from './components/DialogPrompt'
import Screen from './components/Screen'
import MainMenu from './menus/MainMenu'
import { VirtualFileProvider } from './components/VirtualFile'

function App() {
  return (
    <>
      <DialogPromptProvider />
      <VirtualFileProvider />
      <Screen>
        <MainMenu />
      </Screen>
    </>
  )
}

export default App
