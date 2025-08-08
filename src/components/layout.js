import { createElement } from '../utils/dom.js';


export function createSidebar(){

    const logoImg = createElement('img', {
        src: 'src/assets/img/ceva-light.png',
        dataset: {
            dark: 'src/assets/img/ceva-dark.png',
            light: 'src/assets/img/ceva-light.png'
        }
    });

    const logoLink = createElement('a', { href: '#anasayfa', class: 'logo' }, [logoImg]);

    const menuItems = [
        { href: '#anasayfa', icon: 'bxs-home', text: 'Anasayfa' },
        { href: '#rota', icon: 'bxs-map', text: 'Rota' },
        { href: '#analiz', icon: 'bxs-doughnut-chart', text: 'Analiz' },
        { href: '#istasyonlar', icon: 'bx-station', text: 'İstasyonlar' },
        { href: '#duzenle', icon: 'bxs-edit', text: 'Düzenle' }
    ];

    const settingsItems = [
        { href: '#ayarlar', icon: 'bxs-cog', text: 'Ayarlar' },
        { href: '#cikis', icon: 'bx-power-off', text: 'Çıkış' }
    ];

    function createMenuList(items) {
        return createElement('ul', {}, items.map(item => {
            const pageName = item.href.replace('#', '');
            return createElement('li', {
                    dataset: { page: pageName }
                }, [
                createElement('a', {
                    href: item.href
                }, [
                    createElement('i', { class: `bx ${item.icon} bx-sm` }),
                    createElement('span', { class: 'text' }, [document.createTextNode(item.text)])
                ])
            ]);
        }));
    }

    const sideMenu = createElement('nav', { class: 'side-menu' }, [
        createMenuList(menuItems),
        //createMenuList(settingsItems)
    ]);

    const sidebar = createElement('aside', { class: 'sidebar' }, [logoLink, sideMenu]);

    return sidebar;
}

export function createContent(){

    const content = createElement('div', { class: 'content' });

    return content;
}


export function createHeader() {

    const themeToggle = createElement('label', { class: 'moon-sun', htmlFor: 'theme-change' }, [
        createElement('i', { class: 'bx bxs-moon' }),
        createElement('i', { class: 'bx bx-sun' }),
    ]);

    const header = createElement('header', { class: 'header' }, [
        createElement('i', { class: 'bx bx-menu bx-sm' }),
        createElement('input', { type: 'checkbox', id: 'theme-change', hidden: true }),
        themeToggle
    ]);

    
    return header;
}


export function createMain(){

    const main = createElement('main', { class: 'main' });

    return main;
}


