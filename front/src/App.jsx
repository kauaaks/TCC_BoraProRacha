import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import Login from "./components/Login";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FieldsManager from "./pages/FieldsManager";
import MyTeam from "./pages/MyTeam";
import InviteAccept from "./pages/InviteAccept";
import Teams from "./components/Teams";
import Games from "./components/Games";
import Payments from "./components/Payments";
import Stats from "./components/Stats";
import Profile from "./pages/Profile";
import JoinTeam from "./pages/invitations/join";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import CriarUsuarioForm from "./components/forms/CriarUsuarioForm";
import CriarTimeForm from "./components/forms/criarTimeForm";

import PrivateRoute from "./routes/PrivateRoute";

import "./App.css";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/privacy-policy"
        element={
          <Layout>
            <PrivacyPolicy />
          </Layout>
        }
      />

    
      <Route
        path="/terms-of-use"
        element={
          <Layout>
            <TermsOfUse />
          </Layout>
        }
      />

      <Route
        path="/convite/:token"
        element={
          <PrivateRoute>
            <Layout>
              <InviteAccept />
            </Layout>
          </PrivateRoute>
        }
      />

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
      <Route
        path="/admin/users/new"
        element={
          <PrivateRoute allowedTypes={["admin"]}>
            <Layout>
             <CriarUsuarioForm />
            </Layout>
          </PrivateRoute>
       }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedTypes={["admin"]}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/fields"
        element={
          <PrivateRoute allowedTypes={["gestor_campo"]}>
            <Layout>
              <FieldsManager />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/my-team"
        element={
          <PrivateRoute allowedTypes={["representante_time", "jogador"]}>
            <Layout>
              <MyTeam />
            </Layout>
          </PrivateRoute>
        }
      />
        <Route
          path="/teams/new"
          element={
            <PrivateRoute allowedTypes={["admin"]}>
              <Layout>
                <CriarTimeForm />
              </Layout>
          </PrivateRoute>
        }
      />

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

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/invitations/join"
        element={
          <PrivateRoute
            allowedTypes={[
              "jogador",
              "representante_time",
              "admin",
              "gestor_campo",
            ]}
          >
            <Layout>
              <JoinTeam />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
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
  );
}

export default App;
