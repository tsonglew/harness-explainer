import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Basics from './pages/Basics'
import Codex from './pages/Codex'
import Compare from './pages/Compare'
import Deepseek from './pages/Deepseek'
import Home from './pages/Home'
import Pi from './pages/Pi'

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/basics" element={<Basics />} />
          <Route path="/deepseek" element={<Deepseek />} />
          <Route path="/pi" element={<Pi />} />
          <Route path="/codex" element={<Codex />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
