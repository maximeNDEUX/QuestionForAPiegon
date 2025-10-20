// /js/utils/stringify.js

export function decodeHTML(str) {
    if (typeof str !== 'string') return '';
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&apos;': "'",
        '&nbsp;': ' ',
        // tu peux ajouter d'autres entités courantes si nécessaire
    };
    // Remplace toutes les entités par leur équivalent
    return str.replace(/&[a-zA-Z0-9#]+;/g, match => entities[match] || match);
}
