document.addEventListener('DOMContentLoaded', () => {
    
    const themeCheckbox = document.getElementById('client-theme-checkbox');
    const body = document.body;
    
    if (!themeCheckbox) return;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('client-light-theme');
            themeCheckbox.checked = true;
        } else {
            body.classList.remove('client-light-theme');
            themeCheckbox.checked = false;
        }
    };

    let currentTheme = localStorage.getItem('client_theme');

    if (!currentTheme) {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        currentTheme = prefersLight ? 'light' : 'dark';
        localStorage.setItem('client_theme', currentTheme);
    }
    
    applyTheme(currentTheme);

    themeCheckbox.addEventListener('change', () => {
        const newTheme = themeCheckbox.checked ? 'light' : 'dark';
        localStorage.setItem('client_theme', newTheme);
        applyTheme(newTheme);
    });
});