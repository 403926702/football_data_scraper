"use strict"
const utils = require('../lib/utils')
const config = require('../lib/config')
// const puppeteer = require('puppeteer-core')
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const userAgent = require('user-agents')
const cheerio = require('cheerio')
const ExcelJS = require('exceljs');
let monent = require('moment')
const proxies = require("../lib/proxies")
const workbook = new ExcelJS.Workbook();
workbook.creator = 'One of the best';
workbook.lastModifiedBy = 'One of the best';
workbook.created = new Date();


let catchURL = async (msg) => {
    try {
        let game = JSON.parse(msg.body)
        console.log('game===> ', game)
        let file = `/Users/hm/Desktop/football相关/球探数据${monent(new Date()).format('YYYY-MM-DD')}.xls`
        let xurl = game.xurl
        const proxy_types = ['http']
        const proxyType = proxy_types[Math.floor(Math.random() * proxy_types.length)]
        let proxy = await proxies.random_proxy({type: proxyType});
        // console.log("xurl====>  ", xurl)
        // console.log("proxy====> ", proxy)
        const proxyMap = {'http': 'http', 'socks': 'socks5'}
        const proxyScheme = proxyMap[proxyType]
        let send = `${config.sever}?timeout=70000--proxy-server=${proxyScheme}://${proxy.host}:${proxy.port}`

        const browser = await puppeteer.connect({
            browserWSEndpoint: send,
            defaultViewport: {width: 1024, height: 768}
        })
        const page = await browser.newPage();
        await page.setUserAgent(new userAgent().toString())

        await page.goto(xurl, {timeout: config.gotoTimeOut, waitUntil: 'networkidle2'}).then().catch(err => {
            throw err
        })

        await page.waitForTimeout(config.timeout)
        await page.waitForSelector('#porlet_8 > table > tbody > tr.red_t1')
        //析析析析析析
        //修改初始化数据 ：初
        await page.evaluate(() => {
            document.querySelector('#hType_v').value = 0
            document.querySelector('#hType_v').onchange()
            document.querySelector('#sType_v').value = 0
            document.querySelector('#sType_v').onchange()
        })
        await page.waitForSelector('body')
        const html = await page.$eval('body', node => node.innerHTML)
        let $ = cheerio.load(html, {decodeEntities: false})
        let init = await page.$x('//*[@id="table_v"]/tbody/tr[1]')
        await init[0].hover()
        await page.waitForTimeout(config.timeout)
        await page.screenshot({path: '../data/daily_xxx.png'})

        let note = $('#table_v > tbody > tr:last-child').text().replace(/\t*/g, '').trim() //拿到析页面战绩数据


        //欧欧欧欧欧欧
        let ourl = game.ourl
        await page.goto(ourl, {timeout: config.gotoTimeOut, waitUntil: 'networkidle2'}).then().catch(err => {
            throw err
        })

        await page.waitForTimeout(config.timeout)
        await page.waitForSelector('#team > table').then().catch(console.dir)

        //修改初始化数据 ：初
        await page.evaluate(() => {
            document.querySelector('#sel_showType').value = 2;
            changeShowType(2);
        }).then().catch(console.dir)

        await page.screenshot({path: '../data/daily_ooo.png'})

        await page.waitForSelector('#dataList').then().catch(console.dir)

        let html_ = await page.$eval('#dataList', node => node.innerHTML)
        let $_ = cheerio.load(html_, {decodeEntities: false})
        let json_o = {}
        let arr_o = []
        let json_o_avg = {}
        if ($_('#oddsList_tab > tbody tr').text() === '') {
            json_o_avg['url'] = [game.ourl]
            console.log('欧。。。。。。没有数据', JSON.parse(msg.body))
            // await page.close()
            // utils.requeue(msg)
        } else {
            $_('#oddsList_tab > tbody tr').map((a, b) => {
                arr_o = []
                if ($_(b).text().includes('威廉希尔')
                   || $_(b).text().includes('Sportsbet.com.au')
                   || $_(b).text().includes('Intertops')
                   || $_(b).text().includes('Interwetten(塞浦路斯)')
                   || $_(b).text().includes('12B(菲律宾)')
                   || $_(b).text().includes('利记sbobet')
                   || $_(b).text().includes('立博')
                   || $_(b).text().includes('澳门')
                ) {
                    arr_o.push(`${game.score1} ${game.crown} ${game.score2}`)
                    arr_o.push(note)
                    $_(b).find('td').map((e, f) => {
                        if ($_(f).text()) {
                            arr_o.push($_(f).text())
                        }
                    })
                    arr_o.push('***')
                    arr_o.push((Number(arr_o[3]) * Number(arr_o[10])).toFixed(2))
                    arr_o.push((Number(arr_o[4]) * Number(arr_o[11])).toFixed(2))
                    arr_o.push((Number(arr_o[5]) * Number(arr_o[12])).toFixed(2))
                    arr_o.push('***')
                    arr_o.push((Number(arr_o[10]) * Number(arr_o[16])).toFixed(2))
                    arr_o.push((Number(arr_o[11]) * Number(arr_o[17])).toFixed(2))
                    arr_o.push((Number(arr_o[12]) * Number(arr_o[18])).toFixed(2))
                    arr_o.push('***')
                    arr_o.push((Number(arr_o[10]) * Number(arr_o[20])).toFixed(2))
                    arr_o.push((Number(arr_o[11]) * Number(arr_o[21])).toFixed(2))
                    arr_o.push((Number(arr_o[12]) * Number(arr_o[22])).toFixed(2))
                    arr_o.push('***')
                    arr_o.push((Number(arr_o[10]) * Number(arr_o[24])).toFixed(2))
                    arr_o.push((Number(arr_o[11]) * Number(arr_o[25])).toFixed(2))
                    arr_o.push((Number(arr_o[12]) * Number(arr_o[26])).toFixed(2))
                    json_o[a] = arr_o

                }
            })
            // console.log('json_o=====> ',json_o)
            if (Object.keys(json_o).length) {
                json_o_avg = await utils.cal_avg(game, json_o, note)
            }
        }
        let label_o = `${game.country}-${game.team}-${game.crown}`.trim().replace(/\s/g, '')
        await utils.wap_xls_o(workbook, file, json_o_avg, label_o).then().catch(console.dir)
        console.log('欧====>写入成功')

        await page.close()
        utils.finish(msg)
    } catch (e) {
        console.log('err===> ', e, JSON.parse(msg.body))
        utils.requeue(msg, config.delay)
    }
}


utils.connectNSQ({
    reader: {
        topic: config.nsq.topic,
        channel: config.nsq.channel,
        options: {
            lookupdHTTPAddresses: config.nsq.lookupd.lookupdHTTPAddresses,
            maxInFlight: config.nsq.maxInFlight
        },
    },
    onRead: catchURL
})

