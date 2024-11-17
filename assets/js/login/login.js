/*
document.getElementById('showRegister').addEventListener('click', function () {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  });
]*/
  document.getElementById('showRegister').parentElement.style.display = 'none'; // descomentar arriba y quitar esto para habilitar el registro

  document.getElementById('showLogin').addEventListener('click', function () {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPassword = document.getElementById('login-password');
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    const registerPassword = document.getElementById('register-password');
  
    // Función para alternar visibilidad de la contraseña y cambiar icono
    function togglePasswordVisibility(passwordField, toggleIcon) {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
      }
    }
  
    // Eventos para login y registro
    toggleLoginPassword.addEventListener('click', () => {
      togglePasswordVisibility(loginPassword, toggleLoginPassword);
    });
  
    toggleRegisterPassword.addEventListener('click', () => {
      togglePasswordVisibility(registerPassword, toggleRegisterPassword);
    });
  });
  