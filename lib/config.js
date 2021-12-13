module.exports = {
    sever: 'ws://127.0.0.1:9222/devtools/browser/2e695d02-a74d-4fdc-8c7b-3675dc99b2be',
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
    gotoTimeOut: 10000,
    games: [

        '超'
    ],
    countries: []
}





