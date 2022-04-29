import MainMenu from './menus/MainMenu'
import { VirtualFileProvider } from './components/VirtualFile'
import DialogProvider from './components/Dialog'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RomList from './menus/RomList'
import RomDetailRoute from './menus/RomDetailRoute'
import RomCreationChoice from './menus/RomCreationChoice'
import RomEditorRoute from './menus/RomEditorRoute'
import StageRoute from './menus/StageRoute'

function App() {
  return (
    <BrowserRouter>
      <DialogProvider />
      <VirtualFileProvider />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/rom">
          <Route path="list" element={<RomList />} />
          <Route path="new" element={<RomCreationChoice />} />
          <Route path="edit/:id" element={<RomEditorRoute />} />
          <Route path="run/:id" element={<StageRoute />} />
          <Route path=":id" element={<RomDetailRoute />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
