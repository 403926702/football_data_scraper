const nsq = require('nsqjs')
const config = require('../lib/config')

const connectNSQ = async (opts) => {
    let hasWriter = typeof opts.writer !== 'undefined'
    let hasReader = typeof opts.reader !== 'undefined'
    console.log("nsq connect!")
    if (hasWriter) {
        const w = new nsq.Writer(opts.writer.host, opts.writer.port)
        w.connect()
        w.on('ready', () => {
            w.publish(opts.writer.topic, opts.body, err => {
                if (err) {
                    return console.error(err.message)
                }
                console.log('Message sent successfully')
                w.close()
            })
        })
        w.on('closed', () => {
            console.log('writer closed')
        })
    }
    if (hasReader) {
        const r = new nsq.Reader(opts.reader.topic, opts.reader.channel, opts.reader.options)
        r.connect()
        r.on(nsq.Reader.MESSAGE, function (msg) {
            touch(msg)
            opts.onRead(msg)
        })
        r.on(nsq.Reader.NSQD_CONNECTED, function (host, port) {
            // console.log('connect nsq!')
        })
    }
}


function touch(msg) {
    if (msg && !msg.hasResponded) {
        msg.touch()
        msg.touchTimer && clearTimeout(msg.touchTimer)
        msg.touchTimer = setTimeout(function (m) {
            touch(m)
        }, msg.timeUntilTimeout() - 1000, msg)
    }
}

function finish(msg) {
    if (msg) {
        if (msg.touchTimer) {
            clearTimeout(msg.touchTimer)
            delete msg.touchTimer
        }
        (!msg.hasResponded) && msg.finish()
    }
}

function requeue(msg, delay, backoff = false) {
    if (msg.attempts < config.maxAttempts) {
        console.log("重试...", msg.attempts)
        if (msg.touchTimer) {
            clearTimeout(msg.touchTimer)
            delete msg.touchTimer
        }
        (!msg.hasResponded) && msg.requeue(delay, backoff)
    } else {
        finish(msg)
    }

}


async function cal_avg(game, json_o, note) {
    let company_num = Object.values(json_o).length
    let avg_arr = []
    let temp3 = [], temp4 = [], temp5 = [], temp6 = [], temp7 = [], temp8 = [], temp9 = [],
       temp10 = [], temp11 = [], temp12 = [], temp16 = [], temp17 = [], temp18 = [], temp20 = [],
       temp21 = [], temp22 = [], temp24 = [], temp25 = [], temp26 = [], temp28 = [], temp29 = [],
       temp30 = [], temp31 = []
    Object.values(json_o).map((data, i) => {
        for (let j = 0; j < data.length; j++) {
            if (j === 3) temp3.push(data[j])
            if (j === 4) temp4.push(data[j])
            if (j === 5) temp5.push(data[j])
            if (j === 6) temp6.push(data[j])
            if (j === 7) temp7.push(data[j])
            if (j === 8) temp8.push(data[j])
            if (j === 9) temp9.push(data[j])
            if (j === 10) temp10.push(data[j])
            if (j === 11) temp11.push(data[j])
            if (j === 12) temp12.push(data[j])
            if (j === 16) temp16.push(data[j])
            if (j === 17) temp17.push(data[j])
            if (j === 18) temp18.push(data[j])
            if (j === 20) temp20.push(data[j])
            if (j === 21) temp21.push(data[j])
            if (j === 22) temp22.push(data[j])
            if (j === 24) temp24.push(data[j])
            if (j === 25) temp25.push(data[j])
            if (j === 26) temp26.push(data[j])
            if (j === 28) temp28.push(data[j])
            if (j === 29) temp29.push(data[j])
            if (j === 30) temp30.push(data[j])
            if (j === 31) temp31.push(data[j])
        }
    })
    avg_arr.push(`${game.score1} ${game.crown} ${game.score2}`)
    avg_arr.push(note)
    avg_arr.push(`${game.ourl}`)
    avg_arr.push(avg(temp3, company_num))
    avg_arr.push(avg(temp4, company_num))
    avg_arr.push(avg(temp5, company_num))
    avg_arr.push(avg(temp6, company_num))
    avg_arr.push(avg(temp7, company_num))
    avg_arr.push(avg(temp8, company_num))
    avg_arr.push(avg(temp9, company_num))
    avg_arr.push(avg(temp10, company_num))
    avg_arr.push(avg(temp11, company_num))
    avg_arr.push(avg(temp12, company_num))
    avg_arr.push('')
    avg_arr.push('')
    avg_arr.push('')
    avg_arr.push(avg(temp16, company_num))
    avg_arr.push(avg(temp17, company_num))
    avg_arr.push(avg(temp18, company_num))
    avg_arr.push('')
    avg_arr.push(avg(temp20, company_num))
    avg_arr.push(avg(temp21, company_num))
    avg_arr.push(avg(temp22, company_num))
    avg_arr.push('')
    avg_arr.push(avg(temp24, company_num))
    avg_arr.push(avg(temp25, company_num))
    avg_arr.push(avg(temp26, company_num))
    avg_arr.push('')
    avg_arr.push(avg(temp28, company_num))
    avg_arr.push(avg(temp29, company_num))
    avg_arr.push(avg(temp30, company_num))
    json_o['avg'] = avg_arr
    return json_o
}

function avg(arr, num) {
    let sum = eval(arr.join("+"))
    return (sum / num).toFixed(2)
}




exports.connectNSQ = connectNSQ;
exports.finish = finish;
exports.requeue = requeue;
exports.cal_avg = cal_avg;
