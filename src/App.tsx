import NavProvider from './components/Nav'
import MainMenu from './menus/MainMenu'
import { VirtualFileProvider } from './components/VirtualFile'
import DialogProvider from './components/Dialog'

function App() {
  return (
    <>
      <DialogProvider />
      <VirtualFileProvider />
      <NavProvider init={<MainMenu />} />
    </>
  )
}

export default App
