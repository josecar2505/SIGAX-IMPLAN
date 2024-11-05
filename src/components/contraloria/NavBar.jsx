import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { FaSignOutAlt, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "../../CSS/NavBar.css";

const NavBar = () => {
    const { logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo-left">
                <img src="https://implanxalisco.mx/images/logo-inegi-blanco.png" alt="Logo INEGI" />
            </div>
            <div className="menu-toggle" onClick={toggleMobileMenu}>
                <FaBars size={24} />
            </div>
            <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
                <Link to="/contraloria/DashboardContralor" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
                <Link to="/contraloria/PlanAuditorias" onClick={() => setMobileMenuOpen(false)}>Plan Anual de Auditorias</Link>
                <Link to="/GestionAuditores" onClick={() => setMobileMenuOpen(false)}>Gestión de Auditores</Link>
                <Link to="/Historico" onClick={() => setMobileMenuOpen(false)}>Historico</Link>
                <Link to="/Auditorias" onClick={() => setMobileMenuOpen(false)}>Auditorias</Link>
            </div>
            <div className="navbar-right">
                <div className="navbar-logo-right">
                    <img src='https://implanxalisco.mx/images/logo_blanco.png' alt="Logo IMPLAN" />
                </div>
            </div>
            <div className="icono-logout">
                    <button className="logout-button" onClick={logout} title="Cerrar sesión">
                        <FaSignOutAlt size={24} />
                    </button>
            </div>
        </nav>
    );
};

export default NavBar;
