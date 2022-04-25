import { DialogPromptProvider } from './components/DialogPrompt'
import Screen from './components/Screen'
import MainMenu from './menus/MainMenu'

function App() {
  return (
    <>
      <DialogPromptProvider />
      <Screen>
        <MainMenu />
      </Screen>
    </>
  )
}

export default App
