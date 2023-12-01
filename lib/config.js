module.exports = {
    sever: 'ws://127.0.0.1:9222/devtools/browser/e94aed8b-043d-40c3-8636-e7f035d934a3',
    nsq: {
        nsqd: {
            host: '192.168.100.143',
            port: 4150
        },
        lookupd: {
            lookupdHTTPAddresses: ['192.168.100.143:4161']
        },
        maxInFlight: 1,
        topic: 'fg_list',
        channel: 'Info',
    },
    maxAttempts: 5,
    delay: 60 * 1000,
    timeout: 1000,
    gotoTimeOut: 20000,
    games:
           [
               '中甲'
           ]
    ,
    countries: []
}





