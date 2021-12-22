const _ = require("lodash")
const ssdb = require("ssdb")
const ping = require("ping")
const async = require("async")
const debug = require("debug")("tmpl-proxy")
const ssdb_pool = ssdb.createPool({
    host: "192.168.10.241",
    port: 8889,
    policy: ssdb.Pool.policies.least_conn,
    size: 1,
    timeout: 0,
    promisify: false,
    thunkify: false
})
const __GLOBAL_PROXY_QUEUE = "bl:global:cache:http:proxies"
const db_ssdb = ssdb_pool.acquire()
exports.random_proxy = getProxy


/**
 * 顺序获取一个代理
 * @param {object}} opts => {type: "http", filter: {key: "source", value: "太阳2"}}
 * @param {function} next 回调函数
 */
async function getProxy(opts, next) {
    if (!opts || typeof opts == "string") {
        opts = {
            type: opts || "http"
        }
    }
    let proxy_type = opts.type || "http"
    let complete = false
    let qn = [__GLOBAL_PROXY_QUEUE, proxy_type].join(":")
    return new Promise((resolve, reject) => {
        debug("qn", qn)
        async.whilst(
           done => done(null, !complete),
           done => {
               debug(`get ${proxy_type}'s proxy`)
               db_ssdb.qpop(qn, async (err, value) => {
                   if (err) {
                       console.log("get data from queue failed", err.message)
                       return setTimeout(done, 5000)
                   }
                   debug(value)
                   if (!value) {
                       complete = true
                       return done(err, null)
                   }
                   let pi = value && JSON.parse(value) || null
                   if (pi && pi.ttl > Date.now()) {
                       //探测代理是否可用
                       let res = await ping.promise.probe(pi.host)
                       if (!res || !res.alive || res.time == 'unknown' || res.time > 300) {
                           if (!pi.attempts) {
                               pi.attempts = 0
                           }
                           pi.attempts++
                           console.log(`skip proxy [${pi.source || ""}] ${pi.host}:${pi.port} - [${res.alive && "ALIVED" || "UNREACHABLE"}]/[${res.time} ms] was ${pi.attempts} times`)
                           if (res.alive && pi.attempts < 10) {
                               debug("regueue", pi)
                               db_ssdb.qpush_back(qn, JSON.stringify(pi))
                           }
                           return done()
                       }
                       debug("requeue", value)
                       delete pi.attempts
                       db_ssdb.qpush_back(qn, JSON.stringify(pi))
                       //如果存在 filter
                       if (opts.filter) {
                           !Array.isArray(opts.filter) && (opts.filter = [opts.filter])
                           let f = true
                           for (i = 0; i < opts.filter.length; i++) {
                               let filter = opts.filter[i]
                               f = pi[filter.key] && pi[filter.key] == filter.value
                               if (!f) {
                                   break
                               }
                           }
                           if (!f) {
                               pi = null
                           }
                       }
                   }
                   complete = pi && pi.ttl > Date.now()
                   debug(`complete ? ${complete} ${JSON.stringify(pi)}`)
                   done(err, pi)
               })
           }, (err, proxy) => {
               if (err) {
                   return reject(err)
               }
               proxy && (proxy.type = proxy_type)
               debug(`result proxy => ${JSON.stringify(proxy)}`)
               resolve(proxy)
           })
    })
}
