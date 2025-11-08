import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import Login from './components/Login'
import Layout from './components/Layout'

import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import FieldsManager from './pages/FieldsManager'
import MyTeam from './pages/MyTeam'

import Teams from './components/Teams'
import Games from './components/Games'
import Payments from './components/Payments'
import Stats from './components/Stats'

import PrivateRoute from './routes/PrivateRoute'

import './App.css'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Dashboard para qualquer usuário autenticado */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Painel Admin - apenas para admin */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedTypes={['admin']}>
            <Layout>
              <AdminPanel />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Painel Gestor - apenas para field_manager */}
      <Route
        path="/fields"
        element={
          <PrivateRoute allowedTypes={['field_manager']}>
            <Layout>
              <FieldsManager />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Painel Representante de Time - apenas para team_rep */}
      <Route
        path="/my-team"
        element={
          <PrivateRoute allowedTypes={['representante_time']}>
            <Layout>
              <MyTeam />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Funcionalidades acessíveis a qualquer usuário autenticado */}
      <Route
        path="/teams"
        element={
          <PrivateRoute>
            <Layout>
              <Teams />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/games"
        element={
          <PrivateRoute>
            <Layout>
              <Games />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <PrivateRoute>
            <Layout>
              <Payments />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/stats"
        element={
          <PrivateRoute>
            <Layout>
              <Stats />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
