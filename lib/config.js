module.exports = {
    sever: 'ws://127.0.0.1:9222/devtools/browser/3bd5aaf9-7565-46ce-9b4e-287bb52dce40',
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
    games:[
        '英超',     '阿甲',
        '欧罗巴杯', '自由杯',
        '美冠杯',   '南美超杯',
        '阿美超',   '里约锦TG',
        '巴西杯',   '阿根廷杯',
        '欧会杯'
    ],
    countries: []
}





