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


let value = 3  //初盘选择 crown
let url = 'http://zq.win007.com/cn/SubLeague/2020-2021/7_1722.html'   //丹麦超
let country = '丹麦超'
let time = '2020-2021'


let rounds_ = 10  //轮数
let row = 2    //行数



let catch_task = async (url) => {
    const proxy_types = ['http']
    const proxyType = proxy_types[Math.floor(Math.random() * proxy_types.length)]
    let proxy = await proxies.random_proxy({type: proxyType});
    // console.log("url====>  ", url)
    // console.log("proxy====> ", proxy)
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
    await page.goto(url, {timeout: config.gotoTimeOut, waitUntil: 'networkidle2'}).then().catch(console.dir)

    await page.waitForSelector('#Table2')
    //选择轮数
    await page.click(`#Table2 > tbody > tr:nth-child(${row}) > td:nth-child(${rounds_ + 1})`)
    let rounds = await page.$eval(`#Table2 > tbody > tr:nth-child(${row}) > td:nth-child(${rounds_ + 1})`,node=>node.innerText)

    //修改初盘
    await page.evaluate((value) => {
        selectCompanyId = value;
        GetOddsDetailId();
        ShowScheduleOdds(value);
    }, value)

    await page.waitForTimeout(2000)
    let html = await page.$eval('html', node => node.innerHTML)
    let $ = cheerio.load(html, {decodeEntities: false})


    let game_arr = []
    $('#Table3 > tbody tr').map((i, tr) => {
        let info = {
            xurl: '',
            ourl: '',
            country: '',
            team: '',
            crown: '',
            score1: '',
            score2: '',
            rounds: rounds,
            time:time
        }
        if ($(tr).find('td:nth-child(9) > a:nth-child(2)').text().includes('欧')) {
            info.xurl = `http://zq.win007.com` + $(tr).find('td:nth-child(9) > a:nth-child(1)').attr('href')
            info.ourl = $(tr).find('td:nth-child(9) > a:nth-child(2)').attr('href')
            info.country = country
            info.team = $(tr).find('td:nth-child(3)>a').text()
            info.score1 = $(tr).find('td:nth-child(6)').text()
            info.crown = $(tr).find('td:nth-child(7)').text().replace(/\//g, '|').replace(/\*/g, '') || '空'
            info.score2 = $(tr).find('td:nth-child(8)').text()
            game_arr.push(info)
        }

    })

    console.log('game_arr===> ', game_arr)

    await page.close()
    await utils.connectNSQ({
        writer: {
            host: config.nsq.nsqd.host,
            port: config.nsq.nsqd.port,
            topic: config.nsq.topic,
        },
        body: game_arr
    })
}

catch_task(url).catch(console.dir)

exports.catch_task = catch_task
