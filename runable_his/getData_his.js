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
        let file = `/Users/hm/Desktop/football相关/${game.country}历史数据${game.time}.xls`/*第${game.rounds}轮.xls*/
        let xurl = game.xurl
        const proxy_types = ['http']
        const proxyType = proxy_types[Math.floor(Math.random() * proxy_types.length)]
        let proxy = await proxies.random_proxy({type: proxyType});
        const proxyMap = {'http': 'http'}
        const proxyScheme = proxyMap[proxyType]
        let send = `${config.sever}?timeout=70000--proxy-server=${proxyScheme}://${proxy.host}:${proxy.port}`
        console.log('send===> ', send)
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
        await page.screenshot({path: '../data/his_xxx.png'})

        let note = $('#table_v > tbody > tr:last-child').text().replace(/\t*/g, '').trim()  //拿到析页面战绩数据

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

        await page.screenshot({path: '../data/his_ooo.png'})

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
            if (!arr_o.length) {
                json_o_avg['url'] = [game.ourl]
            }
            // console.log('json_o=====> ',json_o)
            if (Object.keys(json_o).length) {
                json_o_avg = await utils.cal_avg(game, json_o, note)
            }
        }
        let label_o = `${game.country}-${game.team}-${game.crown}-${game.rounds}`.trim().replace(/\s/g, '')
        await wap_xls_o(file, json_o_avg, label_o).then().catch(console.dir)
        console.log('欧====>写入成功')

        await page.close()
        utils.finish(msg)
    } catch (e) {
        console.log('err===> ', e, JSON.parse(msg.body))
        utils.requeue(msg, config.delay)
    }
}

async function wap_xls_o(file, json_o, label_o) {
    const worksheet = await workbook.addWorksheet(label_o, {properties: {tabColor: {argb: 'c30101'}}});
    let cols = [
        {header: '指数', key: 'index', width: 20},
        {header: '胜率', key: 'odds', width: 75},
        {header: '所有公司', key: 'company', width: 32},
        {header: '主胜', key: 'home_win', width: 10},
        {header: '和', key: 'draw', width: 10},
        {header: '客胜', key: 'guest_win', width: 10},
        {header: '主胜率', key: 'home_win_rate', width: 10},
        {header: '和率', key: 'draw_rate', width: 10},
        {header: '客胜率', key: 'guest_win_rate', width: 10},
        {header: '返还率', key: 'return_rate', width: 10},
        {header: '凯利指数', key: 'kelly_index1', width: 10},
        {header: '凯利指数', key: 'kelly_index2', width: 10},
        {header: '凯利指数', key: 'kelly_index3', width: 10},
        {header: '变化时间', key: 'change_time', width: 12},
        {header: '历史指数', key: 'history_index', width: 12},
        {header: '', key: '', width: 12},  //间隔
        {header: '主胜-1', key: '主胜-1', width: 12},
        {header: '和-1', key: '和-1', width: 12},
        {header: '客胜-1', key: '客胜-1', width: 12},
        {header: '', key: '', width: 12},  //间隔
        {header: '主胜-2', key: '主胜-2', width: 12},
        {header: '和-2', key: '和-2', width: 12},
        {header: '客胜-2', key: '客胜-2', width: 12},
        {header: '', key: '', width: 12},  //间隔
        {header: '主胜-3', key: '主胜-3', width: 12},
        {header: '和-3', key: '和-3', width: 12},
        {header: '客胜-3', key: '客胜-3', width: 12},
        {header: '', key: '', width: 12},  //间隔
        {header: '主胜-4', key: '主胜-4', width: 12},
        {header: '和-4', key: '和-4', width: 12},
        {header: '客胜-4', key: '客胜-4', width: 12} //29
    ];
    worksheet.columns = cols
    Object.values(json_o).map(async (data) => {
        await worksheet.addRow(wrap_ifo(cols, data))
    })
    await workbook.xlsx.writeFile(file)
}


function wrap_ifo(cols, data) {
    let res = {}
    cols.map((col, j) => {
        res[col.key] = data[j]
    })
    return res
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

