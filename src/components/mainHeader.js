import { createElement } from '../utils/dom.js';

export function createMainHeader(panelTitle = "Kontrol Paneli", currentPage = "Anasayfa") {
    const breadcrumb = createElement('ul', { class: 'breadcrumb' }, [
        createElement('li', {}, [
            createElement('a', { href: '#anasayfa', textContent: panelTitle })
        ]),
        createElement('li', {}, [
            createElement('i', { class: 'bx bx-chevron-right' })
        ]),
        createElement('li', {}, [
            createElement('a', {
                href: '#',
                class: 'active',
                textContent: currentPage
            })
        ])
    ]);

    const leftDiv = createElement('div', { class: 'left' }, [breadcrumb]);

    const headDiv = createElement('div', { class: 'head-title' }, [leftDiv]);

    return headDiv;
}
