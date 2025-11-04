document.addEventListener('DOMContentLoaded', () => {

    apiFetch('/api/auth/verificar', 'GET').then(data => {
        if (data.success && data.autenticado && data.tipo === 'cliente') {
            window.location.href = '/cliente/dashboard/';
        }
    }).catch(() => {
    });

    const toggleToRegister = document.getElementById('toggle-to-register');
    const toggleToLogin = document.getElementById('toggle-to-login');
    const body = document.body;

    toggleToRegister.addEventListener('click', () => {
        body.classList.add('show-register');
    });

    toggleToLogin.addEventListener('click', () => {
        body.classList.remove('show-register');
    });

    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginButton.disabled = true;
        loginButton.textContent = 'Ingresando...';
        loginError.style.display = 'none';

        const data = {
            usuario: document.getElementById('login-usuario').value,
            password: document.getElementById('login-password').value
        };

        try {
            const response = await apiFetch('/api/auth/login-cliente', 'POST', data);
            if (response.success) {
                window.location.href = '/tienda/';
            }
        } catch (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
            loginButton.disabled = false;
            loginButton.textContent = 'Ingresar';
        }
    });

    const registerForm = document.getElementById('register-form');
    const registerButton = document.getElementById('register-button');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerButton.disabled = true;
        registerButton.textContent = 'Registrando...';
        registerError.style.display = 'none';
        registerSuccess.style.display = 'none';

        const data = {
            usuario: document.getElementById('register-usuario').value,
            email: document.getElementById('register-email').value,
            nombre: document.getElementById('register-nombre').value,
            apellido: document.getElementById('register-apellido').value,
            password: document.getElementById('register-password').value
        };

        try {
            const response = await apiFetch('/api/auth/register-cliente', 'POST', data);
            if (response.success) {
                registerSuccess.textContent = '¡Registro exitoso! Revisa tu email. Serás redirigido al login.';
                registerSuccess.style.display = 'block';
                registerForm.reset();
                setTimeout(() => {
                    body.classList.remove('show-register');
                    registerSuccess.style.display = 'none';
                }, 3000);
            }
        } catch (error) {
            registerError.textContent = error.message;
            registerError.style.display = 'block';
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Registrarse';
        }
    });
});