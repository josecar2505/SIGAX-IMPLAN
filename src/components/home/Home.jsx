import React from 'react'
import './home.css'
import logo from '../../assets/logoChido.png'; 
import { Link } from 'react-router-dom';


const home = () => {
    return (
        <div className="home-container">
          <div className="logo-container">
            <img src={logo} alt="logo" className="logo" />
          </div>
          <h1 className="title">SIGAX</h1>
          <div className="divider"></div> 
          <p className="subtitle">SISTEMA INTEGRAL DE GESTIÓN DE AUDITORÍAS DE XALISCO</p>
          <Link to ={'/login'} className='access-button'>Acceder</Link>
        </div>
      );
}

export default home