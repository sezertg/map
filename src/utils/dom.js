export function createElement(tag, options = {}, children = []) {
    const el = document.createElement(tag);

    Object.entries(options).forEach(([key, value]) => {
        if (value === false || value === undefined || value === null) return;

        if (key === 'class') {
            el.className = value;
        }
        else if (key === 'style') {
            if (typeof value === 'string') {
                el.style.cssText = value;
            } else if (typeof value === 'object') {
                Object.assign(el.style, value);
            }
        }
        else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                el.dataset[dataKey] = dataValue;
            });
        }
        else if (key === 'htmlFor') {
            el.htmlFor = value;
        }
        else {
            el[key] = value;
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    });


    return el;
}