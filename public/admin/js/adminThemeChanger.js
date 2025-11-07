document.addEventListener('DOMContentLoaded', () => {
    
    const themeCheckbox = document.getElementById('admin-theme-checkbox');
    const body = document.body;
    
    if (!themeCheckbox) return;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('admin-light-theme');
            themeCheckbox.checked = true;
        } else {
            body.classList.remove('admin-light-theme');
            themeCheckbox.checked = false;
        }
    };

    let currentTheme = localStorage.getItem('admin_theme');

    if (!currentTheme) {
        currentTheme = 'dark'; 
        localStorage.setItem('admin_theme', currentTheme);
    }
    
    applyTheme(currentTheme);

    themeCheckbox.addEventListener('change', () => {
        const newTheme = themeCheckbox.checked ? 'light' : 'dark';
        localStorage.setItem('admin_theme', newTheme);
        applyTheme(newTheme);
    });
});