"use strict"

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const userAgent = require('user-agents')
// const puppeteer = require('puppeteer-core')
const cheerio = require('cheerio')
const config = require('../lib/config')
const utils = require('../lib/utils')
const proxies = require("../lib/proxies")
const _ = require("lodash")


let games = config.games


;(async (games) => {
    let uri = 'http://live.titan007.com/index2in1.aspx?id=3'
    const proxy_types = ['socks']
    const proxyType = proxy_types[Math.floor(Math.random() * proxy_types.length)]
    let proxy = await proxies.random_proxy({type: proxyType});
    // let proxy =null
    console.log("uri====>  ", uri)
    console.log("proxy====> ", proxy)
    const proxyMap = {'http': 'http'}
    const proxyScheme = proxyMap[proxyType]
    let endpoint = `${config.sever}?timeout=70000`
    if (!!proxy) {
        endpoint = `${config.sever}?timeout=70000--proxy-server=${proxyScheme}://${proxy.host}:${proxy.port}`
    }
    const browser = await puppeteer.connect({
        browserWSEndpoint: endpoint,
        defaultViewport: {width: 1024, height: 768}
    })
    const page = await browser.newPage();
    await page.setUserAgent(new userAgent().toString())
    await page.goto(uri, {timeout: config.gotoTimeOut/*, waitUntil: 'networkidle2'*/}).then().catch(console.dir)
    //完整
    await page.click('#button6')
    await page.waitForSelector('#table_live > tbody')
    const html = await page.$eval('html', node => node.innerHTML)
    const $ = cheerio.load(html, {decodeEntities: false})
    setTimeout(async function () {
        await page.close()
    }, 1000)
    let game_arr = []
    $('#table_live > tbody tr').map(async (i, d) => {
        let j = 0
        let len = games.length
        for (j; j < len; j++) {
            if ($(d).text().includes(games[j]) && $(d).text().includes('析') && $(d).text().includes('欧')) {
                let info = {}
                let id = _.get($(d).attr('id').split('_'), '[1]', '')
                info['country'] = games[j]
                $(d).find('td a').map((idx, r) => {
                    if ($(r).text() === '析' && $(r).attr('title') === '数据分析') {
                        info['xurl'] = `http://zq.titan007.com/analysis/${id ? id : '无id'}sb.htm`
                    }
                    if ($(r).text() === '欧' && $(r).attr('title') === '胜平负') {
                        info['ourl'] = `http://op1.titan007.com/oddslist/${id ? id : ''}.htm`
                    }
                })
                info['team'] = $(d).find(`td > #${`team1_${id}`}`).text()
                info['score1'] = $(d).find('td.oddss > .odds3').text()
                // info['crown'] = $(d).find('td:nth-child(11) > div:nth-child(1)').text().replace(/\//g, '|').replace(/\*/g, '') || '无'
                // info['score2'] = $(d).find('td:nth-child(12) > div:nth-child(1)').text()



                game_arr.push(info)


            }
        }
    })

    console.log('game_arr===> ', game_arr)
    await utils.connectNSQ({
        writer: {
            host: config.nsq.nsqd.host,
            port: config.nsq.nsqd.port,
            topic: config.nsq.topic,
        },
        body: game_arr
    })
})(games)




