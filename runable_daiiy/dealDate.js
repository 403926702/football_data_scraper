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
'荷甲[2]\n' +
   '葡甲[1]\n' +
   '东南锦[1]\n' +
   '希腊杯[4]\n' +
   '土超[2]\n' +
   '葡杯[4]\n' +
   '比利时杯[2]'


let arr = str.split('\n')
let res_arr = []
arr.map((d,i)=>{
    res_arr.push(d.replace(/\[\d*\]/g, ''))
})
console.log(res_arr)




