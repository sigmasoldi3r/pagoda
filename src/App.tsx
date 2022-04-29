import MainMenu from './menus/MainMenu'
import { VirtualFileProvider } from './components/VirtualFile'
import DialogProvider from './components/Dialog'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RomList from './menus/RomList'
import RomDetails from './menus/RomDetails'
import RomCreationChoice from './menus/RomCreationChoice'

function App() {
  return (
    <>
      <DialogProvider />
      <VirtualFileProvider />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/rom">
            <Route path="list" element={<RomList />} />
            <Route path="new" element={<RomCreationChoice />} />
            <Route path="edit/:id" element={<div></div>} />
            <Route path="run/:id" element={<div></div>} />
            <Route path=":id" element={<RomDetails />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
