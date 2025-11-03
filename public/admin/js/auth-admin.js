document.addEventListener('DOMContentLoaded', () => {
    
    apiFetch('/api/auth/verificar', 'GET').then(data => {
        if (data.success && data.autenticado && data.tipo === 'admin') {
            window.location.href = '/admin/dashboard/';
        }
    }).catch(() => {
    });

    const loginForm = document.getElementById('login-admin-form');
    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginButton = document.getElementById('login-button');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        loginButton.disabled = true;
        loginButton.textContent = 'Ingresando...';

        const data = {
            usuario: usuarioInput.value,
            password: passwordInput.value
        };

        try {
            const response = await apiFetch('/api/auth/login-admin', 'POST', data);

            if (response.success) {
                window.location.href = '/admin/dashboard/';
            } 

        } catch (error) {
            errorMessage.textContent = error.message || 'Error de conexión. Intente de nuevo.';
            errorMessage.style.display = 'block';
            
            loginButton.disabled = false;
            loginButton.textContent = 'Ingresar';
        }
    });
});