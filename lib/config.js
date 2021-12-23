module.exports = {
    sever: 'ws://127.0.0.1:9222/devtools/browser/cef467d5-90a2-4ed1-9033-0a28a501f13d',
    nsq: {
        nsqd: {
            host: '192.168.100.143',
            port: 4150
        },
        lookupd: {
            lookupdHTTPAddresses: ['192.168.100.143:4161']
        },
        maxInFlight: 1,
        topic: 'football',
        channel: 'gameInfo',
    },
    maxAttempts: 5,
    delay: 60 * 1000,
    timeout: 0,
    gotoTimeOut: 20000,
    games: [
        '西甲',   '意甲',
        '法甲',   '苏超',
        '荷甲',   '英联杯',
        '以超',   '北爱超',
        '希腊杯', '土超',
        '土甲',   '葡杯',
        '澳洲甲', '比利时杯',
        '澳足总'
    ],
    countries: []
}





