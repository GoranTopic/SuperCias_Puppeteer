const make_logger = ({ proxy, ruc } = {}) => {
    proxy = proxy || process.env['proxy'] || 'no-proxy';
    if(proxy === 'no-proxy')
        proxy = 'no-proxy'
    else
        proxy = proxy.split(':')[0]
    ruc = ruc || process.env['company'] && JSON.parse(process.env['company']).ruc || 'no-ruc';
    // make a console whichi print [${ruc}][${proxy}]${message}
    return {
        log: (...args) => console.log(`[${ruc}][${proxy}]`, ...args),
        info: (...args) => console.info(`[${ruc}][${proxy}]`, ...args),
        warn: (...args) => console.warn(`[${ruc}][${proxy}]`, ...args),
        error: (...args) => console.error(`[${ruc}][${proxy}]`, ...args),
    }
}

export default make_logger;

