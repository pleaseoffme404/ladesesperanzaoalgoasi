document.addEventListener('DOMContentLoaded', () => {

    const welcomeName = document.getElementById('welcome-name');
    const profileUsuario = document.getElementById('profile-usuario');
    const profileEmail = document.getElementById('profile-email');
    const logoutButton = document.getElementById('logout-button');

    async function loadDashboard() {
        try {
            const data = await apiFetch('/api/clientes/perfil', 'GET');
            
            if (data.success) {
                const user = data.data;
                welcomeName.textContent = `Bienvenid@, ${user.nombre}`;
                profileUsuario.textContent = user.usuario;
                profileEmail.textContent = user.email;
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            window.location.href = '/cliente/';
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await apiFetch('/api/auth/logout', 'POST');
                window.location.href = '/cliente/';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        });
    }

    loadDashboard();
});