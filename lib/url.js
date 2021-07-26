const codec = require('./codec');
const defaultConfig = {
    prefix: '/service/',
    codec: 'plain'
};

class URLWrapper {
    constructor(config = defaultConfig) {
        this.prefix = config.prefix || defaultConfig.prefix;
        this.codec = codec[config.codec || 'plain'] || codec['plain'];
        this.regex = /^(#|about:|data:|blob:|mailto:|javascript:)/;
    };
    wrap(val, config = {}) {
        if (!val || this.regex.test(val)) return val;  
        let flags = '';
        (config.flags || []).forEach(flag => flags += `${flag}_/`);
        return (config.origin || '') + this.prefix + flags + this.codec.encode(config.base ? new URL(val, config.base) : val) + '/';
    };
    unwrap(val, config = { leftovers: false, }) {
        if (!val || this.regex.test(val)) return val;
        let processed = val.slice((config.origin || '').length + this.prefix.length);
        const flags = ('/' + processed).match(/(?<=\/)(.*?)(?=_\/)/g) || [];
        flags.forEach(flag => processed = processed.slice(`${flag}_/`.length));
        let [ url, leftovers ] = processed.split(/\/(.+)?/);
        return config.flags ? { value: this.codec.decode((url || '')) + (config.leftovers && leftovers ? leftovers : ''), flags } : this.codec.decode((url || '')) + (config.leftovers && leftovers ? leftovers : '');
    };
};  

module.exports = URLWrapper;