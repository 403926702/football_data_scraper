"use strict"
const utils = require('../lib/utils')
const config = require('../lib/config')
const puppeteer = require('puppeteer-core')
const cheerio = require('cheerio')
const ExcelJS = require('exceljs');
let monent = require('moment')
const workbook = new ExcelJS.Workbook();
workbook.creator = 'One of the best';
workbook.lastModifiedBy = 'One of the best';
workbook.created = new Date();

let file = `/Users/hm/Desktop/football相关/球探数据${monent(new Date()).format('YYYY-MM-DD')}.xls`

let catchURL = async (msg) => {
    try {
        let game = JSON.parse(msg.body)
        console.log('game===> ', game)
        let xurl = game.xurl
        let send = config.sever
        const browser = await puppeteer.connect({
            browserWSEndpoint: send,
            defaultViewport: {width: 1024, height: 768}
        })
        const page = await browser.newPage();
        await page.goto(xurl, {timeout: config.gotoTimeOut}).then().catch(err => {
            throw err
        })
        await page.screenshot({path: '../data/net_xxx.png'})

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

        await page.screenshot({path: '../data/xxx.png'})

        let json_x = {}
        let arr_x = []

        $('#table_v > tbody tr').map((a, b) => {
            if ($(b).attr('id')) {
                arr_x = []
                $(b).find('td').map((e, f) => {
                    arr_x.push($(f).text())
                })
                json_x[a] = arr_x
            }
        })
        // 西甲-巴列卡诺(主)-平/半
        let team_name_x = $('div.analyhead > div.home > a').text()
        let label_x = `${game.country}-${team_name_x}-${game.crown}-X`.trim().replace(/\s/g, '')
        if (label_x.length > 30) {
            label_x = label_x.substring(0, 29) + 'X'
        }

        wap_xls_x(json_x, label_x)


        //欧欧欧欧欧欧
        let ourl = game.ourl
        await page.goto(ourl, {timeout: config.gotoTimeOut}).then().catch(err => {
            throw err
        })
        await page.screenshot({path: '../data/net_ooo.png'})

        await page.waitForTimeout(config.timeout)
        await page.waitForSelector('#team > table').then().catch(console.dir)

        //修改初始化数据 ：初
        await page.evaluate(() => {
            document.querySelector('#sel_showType').value = 2;
            changeShowType(2);
        }).then().catch(console.dir)

        await page.screenshot({path: '../data/ooo.png'})

        await page.waitForSelector('#dataList').then().catch(console.dir)

        let html_ = await page.$eval('#dataList', node => node.innerHTML)
        let $_ = cheerio.load(html_, {decodeEntities: false})
        let json_o = {}
        let arr_o = []
        let json_o_avg = {}
        if ($_('#oddsList_tab > tbody tr').text() === '') {
            console.log('欧。。。。。。没有数据', JSON.parse(msg.body))
            // await page.close()
            // utils.requeue(msg)
        } else {
            $_('#oddsList_tab > tbody tr').map((a, b) => {
                arr_o = []
                if ($_(b).text().includes('威廉希尔')
                   || $_(b).text().includes('Sportsbet.com.au')
                   || $_(b).text().includes('Intertops')
                   || $_(b).text().includes('Interwetten')
                   || $_(b).text().includes('利记sbobet')
                   || $_(b).text().includes('立博')
                   || $_(b).text().includes('澳门')
                ) {
                    $_(b).find('td').map((e, f) => {
                        if ($_(f).text()) {
                            arr_o.push($_(f).text())
                        }
                    })
                    arr_o.push('111')
                    arr_o.push((Number(arr_o[1]) * Number(arr_o[8])).toFixed(2))
                    arr_o.push((Number(arr_o[2]) * Number(arr_o[9])).toFixed(2))
                    arr_o.push((Number(arr_o[3]) * Number(arr_o[10])).toFixed(2))
                    arr_o.push('222')
                    arr_o.push((Number(arr_o[8]) * Number(arr_o[14])).toFixed(2))
                    arr_o.push((Number(arr_o[9]) * Number(arr_o[15])).toFixed(2))
                    arr_o.push((Number(arr_o[10]) * Number(arr_o[16])).toFixed(2))
                    arr_o.push('333')
                    arr_o.push((Number(arr_o[8]) * Number(arr_o[18])).toFixed(2))
                    arr_o.push((Number(arr_o[9]) * Number(arr_o[19])).toFixed(2))
                    arr_o.push((Number(arr_o[10]) * Number(arr_o[20])).toFixed(2))
                    arr_o.push('444')
                    arr_o.push((Number(arr_o[8]) * Number(arr_o[22])).toFixed(2))
                    arr_o.push((Number(arr_o[9]) * Number(arr_o[23])).toFixed(2))
                    arr_o.push((Number(arr_o[10]) * Number(arr_o[24])).toFixed(2))

                    json_o[a] = arr_o
                }
            })
            json_o_avg = cal_avg(json_o)
        }
        // console.log(json_o)

        let label_o = `${game.country}-${team_name_x}-${game.crown}-O`.trim().replace(/\s/g, '')
        if (label_o.length > 30) {
            label_o = label_o.substring(0, 29) + 'O'
        }
        // json_o_avg['url'] = [game.ourl]
        wap_xls_o(json_o_avg, label_o)
        await page.close()
        utils.finish(msg)
    } catch (e) {
        console.log('err===> ', e, JSON.parse(msg.body))
        utils.requeue(msg, config.delay)
    }
}


function cal_avg(json_o) {
    let company_num = Object.values(json_o).length
    let avg_arr = []
    let temp1 = [], temp2 = [], temp3 = [], temp4 = [], temp5 = [], temp6 = [], temp7 = [], temp8 = [], temp9 = [],
       temp10 = [], temp14 = [], temp15 = [], temp16 = [], temp18 = [], temp19 = [], temp20 = [], temp22 = [],
       temp23 = [], temp24 = [], temp26 = [], temp27 = [], temp28 = []
    Object.values(json_o).map((data, i) => {
        for (let j = 0; j < data.length; j++) {
            if (j === 1) temp1.push(data[j])
            if (j === 2) temp2.push(data[j])
            if (j === 3) temp3.push(data[j])
            if (j === 4) temp4.push(data[j])
            if (j === 5) temp5.push(data[j])
            if (j === 6) temp6.push(data[j])
            if (j === 7) temp7.push(data[j])
            if (j === 8) temp8.push(data[j])
            if (j === 9) temp9.push(data[j])
            if (j === 10) temp10.push(data[j])
            if (j === 14) temp14.push(data[j])
            if (j === 15) temp15.push(data[j])
            if (j === 16) temp16.push(data[j])
            if (j === 18) temp18.push(data[j])
            if (j === 19) temp19.push(data[j])
            if (j === 20) temp20.push(data[j])
            if (j === 22) temp22.push(data[j])
            if (j === 23) temp23.push(data[j])
            if (j === 24) temp24.push(data[j])
            if (j === 26) temp26.push(data[j])
            if (j === 27) temp27.push(data[j])
            if (j === 28) temp28.push(data[j])
        }
    })
    avg_arr.push('')
    avg_arr.push(avg(temp1, company_num))
    avg_arr.push(avg(temp2, company_num))
    avg_arr.push(avg(temp3, company_num))
    avg_arr.push(avg(temp4, company_num))
    avg_arr.push(avg(temp5, company_num))
    avg_arr.push(avg(temp6, company_num))
    avg_arr.push(avg(temp7, company_num))
    avg_arr.push(avg(temp8, company_num))
    avg_arr.push(avg(temp9, company_num))
    avg_arr.push(avg(temp10, company_num))
    avg_arr.push('')
    avg_arr.push('')
    avg_arr.push('')
    avg_arr.push(avg(temp14, company_num))
    avg_arr.push(avg(temp15, company_num))
    avg_arr.push(avg(temp16, company_num))
    avg_arr.push('')
    avg_arr.push(avg(temp18, company_num))
    avg_arr.push(avg(temp19, company_num))
    avg_arr.push(avg(temp20, company_num))
    avg_arr.push('')
    avg_arr.push(avg(temp22, company_num))
    avg_arr.push(avg(temp23, company_num))
    avg_arr.push(avg(temp24, company_num))
    avg_arr.push('')
    avg_arr.push(avg(temp26, company_num))
    avg_arr.push(avg(temp27, company_num))
    avg_arr.push(avg(temp28, company_num))

    json_o['avg'] = avg_arr
    return json_o
}


function wap_xls_o(json_o, team1) {
    const worksheet = workbook.addWorksheet(team1, {properties: {tabColor: {argb: 'c30101'}}});
    let cols = [
        {header: '所有公司', key: 'company', width: 30},
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
    Object.values(json_o).map((data) => {
        worksheet.addRow(wrap_ifo_x(cols, data))
    })
    workbook.xlsx.writeFile(file).then(() => {
        console.log('欧写入成功...')
    }).catch((err) => {
        console.log(err)
    })
}


function wap_xls_x(json_x, team) {
    const worksheet = workbook.addWorksheet(team, {properties: {tabColor: {argb: 'c30101'}}});
    let cols = [
        {header: '类型', key: 'gameType', width: 10},
        {header: '日期', key: 'date', width: 10},
        {header: '主场', key: 'home', width: 15},
        {header: '比分(半场)', key: 'score', width: 15},
        {header: '角球', key: 'corner', width: 8},
        {header: '客场', key: 'guest', width: 15},
        {header: '主', key: 'home_1', width: 8},
        {header: '盘口', key: 'mouth', width: 10},
        {header: '客', key: 'guest_1', width: 8},
        {header: '主', key: 'home_2', width: 8},
        {header: '和', key: 'draw', width: 8},
        {header: '客', key: 'guest_2', width: 8},
        {header: '胜负', key: 'outcome', width: 8},
        {header: '让球', key: 'letBall', width: 8},
        {header: '进球数', key: 'into', width: 8},
    ];

    worksheet.columns = cols
    Object.values(json_x).map((data) => {
        worksheet.addRow(wrap_ifo_x(cols, data))
    })
    workbook.xlsx.writeFile(file).then(() => {
        console.log('析写入成功...')
    }).catch((err) => {
        console.log(err)
    })
}

function wrap_ifo_x(cols, data) {
    let res = {}
    cols.map((col, j) => {
        if (col.header == '主' || col.header == '客' || col.header == '和'
           || col.header == '主胜' || col.header == '客胜' || col.header == '主胜率'
           || col.header == '和率' || col.header === '客胜率' || col.header == '返还率'
           || col.header == '凯利指数'
        ) {
            res[col.key] = Number(data[j])
        } else {
            res[col.key] = data[j]
        }
    })
    return res
}

function avg(arr, num) {
    let sum = eval(arr.join("+"))
    return (sum / num).toFixed(2)
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

