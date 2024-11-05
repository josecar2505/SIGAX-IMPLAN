import './App.css';
import Home from './components/home/Home';
import Login from './components/login/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext'; // Importar el proveedor de autenticación
import PrivateRoute from './components/auth/PrivateRoute'; // Importar el componente de rutas privadas
import ForgotPassword from './components/login/ForgotPassword';
import GestionAuditores from './components/contraloria/GestionAuditores';
import PlanAuditorias from './components/contraloria/PlanAuditorias';
import AuditoriaForm from './components/contraloria/AuditoriaForm';
import PlanificarAuditorias from './components/contraloria/PlanificarAuditorias';
import DashboardContralor from './components/contraloria/DashBoardContralor';

function App() {
  return (
    <AuthProvider> {/* Proveedor de autenticación envolviendo toda la app */}
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path='/' element={<Home />} />
          <Route path='login' element={<Login />} />
          <Route path='forgotPassword' element={<ForgotPassword />} />

          {/* Rutas Privadas - Auditor */}
          {/* Gestión de Auditores - Solo Contralor */}
          <Route path='contraloria/gestionAuditores' element={
            <PrivateRoute requiredRole="CONTRALOR">
              <GestionAuditores />
            </PrivateRoute>
          } />

          {/* Plan Anual de Auditorías - Solo Contralor */}
          <Route path='contraloria/PlanAuditorias' element={
            <PrivateRoute requiredRole="CONTRALOR">
              <PlanAuditorias />
            </PrivateRoute>
          } />

          {/* Planificar Auditorías - Solo Contralor */}
          <Route path='contraloria/planificar-auditorias/:nombrePlanAnual' element={
            <PrivateRoute requiredRole="CONTRALOR">
              <PlanificarAuditorias />
            </PrivateRoute>
          } />

          {/* Dashboard Contralor*/}
          <Route path='contraloria/DashboardContralor' element={
            <PrivateRoute requiredRole="CONTRALOR">
              <DashboardContralor />
            </PrivateRoute>
          } />

          <Route path="/auditoria/:id" element={<AuditoriaForm />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
