import React from 'react';
import { useForm } from 'react-hook-form';
import { FaUserLarge } from "react-icons/fa6";
import { AiOutlineArrowLeft } from 'react-icons/ai'; 
import { Link, useNavigate } from 'react-router-dom';
import '../../CSS/login.css';

const ForgotPassword = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate(); // Hook para la navegación

  const onSubmit = async (data) => {
    console.log(data.username);
    // Aquí puedes agregar la lógica para enviar el correo de restablecimiento de contraseña.
    // Después de enviar, redirige al usuario a otra página si es necesario:
    navigate('/'); // Redirige al usuario a la página de inicio (o donde desees)
  };

  return (
    <div className="login-page">
      <div className="login-back-button-container">
        <Link to="/login" className="back-button">
          <AiOutlineArrowLeft size={22} /> 
        </Link>
      </div>
      <div className="login-container">
        <div className="image-forgotPass-container"></div>
        <div className="form-container">
          <h2>¿Olvidaste tu contraseña?</h2>
          <p>Escríbenos tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-container">
              <FaUserLarge className="icon" />
              <input
                type="text"
                className='login-input'
                placeholder="Usuario"
                {...register("username", { required: true })} // Validación nativa para campo requerido
              />
            </div>
            <button type="submit" className='login-button'>Enviar correo para restablecer contraseña</button>
            <br />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
