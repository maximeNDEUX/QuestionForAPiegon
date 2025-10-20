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
        '&ocirc;': 'ô',
        '&eacute;': 'é',
        '&egrave;': 'è',
        '&rsquo;': '’',
        // ajouter d'autres entités si besoin
    };
    return str.replace(/&[a-zA-Z0-9#]+;/g, match => entities[match] || match);
}
