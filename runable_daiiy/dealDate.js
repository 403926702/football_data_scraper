const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
workbook.creator = 'One of the best';
workbook.lastModifiedBy = 'One of the best';
workbook.created = new Date(2021, 8, 7);
const worksheet = workbook.addWorksheet('game');
let monent = require('moment')


// let a = '巴西甲-乔沛高恩斯SC(主)0-1(0-0)完利斯菲体育会PE'.substring(0, 29) + '-X' //7
// console.log(a.length)


let str =
`英超[1]
阿甲[1]
欧罗巴杯[8]
自由杯[3]
美冠杯[4]
南美超杯[1]
阿美超[2]
里约锦TG[1]
巴西杯[8]
阿根廷杯[2]
欧会杯[8]`

let arr = str.split('\n')
let res_arr = []
arr.map((d,i)=>{
    res_arr.push(d.replace(/\[\d*\]/g, ''))
})
console.log(res_arr)




