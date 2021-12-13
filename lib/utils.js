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

exports.connectNSQ = connectNSQ;
exports.finish = finish;
exports.requeue = requeue;
