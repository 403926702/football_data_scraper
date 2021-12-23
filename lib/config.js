module.exports = {
    sever: 'ws://127.0.0.1:9222/devtools/browser/1dbc7373-7d8d-48c5-b98c-30cfb05247d8',
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
    timeout: 1000,
    gotoTimeOut: 20000,
    games: [
        '荷甲',     '葡甲',
        '东南锦',   '希腊杯',
        '土超',     '葡杯',
        '比利时杯'
    ],
    countries: []
}





