const puppeteer = require('puppeteer-core')
const cheerio = require('cheerio')
const config = require('../lib/config')
const utils = require('../lib/utils')
const proxies = require("../lib/proxies")


let games = config.games


;(async (games) => {
    let uri = 'http://live.win007.com/'
    const proxy_types = ['http', 'socks']
    const proxyType = proxy_types[Math.floor(Math.random() * proxy_types.length)]
    let proxy = await proxies.random_proxy({type: proxyType});
    console.log("uri====>  ", uri)
    console.log("proxy====> ", proxy)
    const proxyMap = {'http': 'http'}
    const proxyScheme = proxyMap[proxyType]
    let send = `${config.sever}?timeout=70000--proxy-server=${proxyScheme}://${proxy.host}:${proxy.port}`
    const browser = await puppeteer.connect({
        browserWSEndpoint: send,
        defaultViewport: {width: 1024, height: 768}
    })
    const page = await browser.newPage();
    await page.goto(uri, {timeout: config.gotoTimeOut, waitUntil: 'networkidle2'}).then().catch(console.dir)
    //展开赛事窗口
    await page.click('#button3')

    //全选
    await page.click('#Layer2 > div.bts > input[type=button]:nth-child(3)')
    // //反选
    // await page.click('#Layer2 > div.bts > input[type=button]:nth-child(4)')
    // //选择比赛
    // await page.evaluate((countries) => {
    //     document.querySelectorAll('#myleague > ul> li').forEach((d) => {
    //         for (let i = 0; i < countries.length; i++) {
    //             if (d.querySelector('label').innerText.split('[')[0] === countries[i]) {
    //                 d.querySelector('label').click()
    //             }
    //         }
    //     })
    // }, countries)
    // await page.waitForTimeout(config.timeout)
    //确定
    await page.click('#Layer2 > div.bts > input[type=button]:nth-child(5)')

    await page.waitForSelector('#table_live > tbody tr')
    const html = await page.$eval('html', node => node.innerHTML)
    const $ = cheerio.load(html, {decodeEntities: false})
    let game_arr = []
    await page.close()

    $('#table_live > tbody tr').map((i, d) => {
        let j = 0
        let len = games.length
        // console.log('$(d).text()======> ',$(d).text())

        for (j; j < len; j++) {
            if ($(d).text().match(games[j])) {
                let info = {
                    xurl: '',
                    ourl: '',
                    country: games[j],
                    team: '',
                    crown: ''
                }
                $(d).find('td.icons2 a ').map((i, u) => {
                    if ($(u).text().includes('析')) {
                        info.xurl = `http://zq.win007.com/analysis/${$(u).attr('onclick').match(/(?<=\()(.*?)(?=\))/g)}sb.htm`
                    }
                    if ($(u).text().includes('欧')) {
                        info.ourl = `http://op1.win007.com/oddslist/${$(u).attr('href').match(/(?<=\()(.*?)(?=\))/g)}.htm`
                    }
                })
                info.team = $(d).find('td:nth-child(5)').text().trim()
                let score1 = $(d).find('td:nth-child(10) > div:nth-child(1)').text()
                let score2 = $(d).find('td:nth-child(12) > div:nth-child(1)').text()
                let crown = $(d).find('td:nth-child(11) > div:nth-child(1)').text().replace(/\//g, '|').replace(/\*/g, '') || '无'
                info.crown = `${score1} ${crown} ${score2}`
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
























