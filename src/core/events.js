import { map } from '../components/map/map.js';

export function setupThemeToggle() {
    const themeChange = document.getElementById('theme-change');
    const logo = document.querySelector('.sidebar .logo img');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeChange.checked = true;
        logo.src = logo.dataset.dark;
    } else {
        document.body.classList.remove('dark');
        themeChange.checked = false;
        logo.src = logo.dataset.light;
    }

    themeChange.addEventListener('change', function () {
        if (this.checked) {
            document.body.classList.add('dark');
            logo.src = logo.dataset.dark;
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            logo.src = logo.dataset.light;
            localStorage.setItem('theme', 'light');
        }
    });
}


export function setupMenuToggle() {
    const menuButton = document.querySelector('.header .bx-menu');
    const sidebar = document.querySelector('.sidebar');

    const savedSidebarState = localStorage.getItem('sidebarHidden');
    if (savedSidebarState === 'true') {
        sidebar.classList.add('hide');
    } else {
        sidebar.classList.remove('hide');
    }

    menuButton.addEventListener('click', () => {
        sidebar.classList.toggle('hide');

        const isHidden = sidebar.classList.contains('hide');
        localStorage.setItem('sidebarHidden', isHidden);

        const animationDuration = 300;
        const startTime = performance.now();

        function step(time) {
            map.invalidateSize();
            if (time - startTime < animationDuration) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    });
}
