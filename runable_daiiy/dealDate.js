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
'西甲[2]\n' +
   '意甲[7]\n' +
   '法甲[10]\n' +
   '苏超[3]\n' +
   '荷甲[5]\n' +
   '英联杯[3]\n' +
   '以超[3]\n' +
   '北爱超[2]\n' +
   '希腊杯[4]\n' +
   '土超[4]\n' +
   '土甲[1]\n' +
   '葡杯[2]\n' +
   '澳洲甲[1]\n' +
   '比利时杯[2]\n' +
   '澳足总[3]'


let arr = str.split('\n')
let res_arr = []
arr.map((d,i)=>{
    res_arr.push(d.replace(/\[\d*\]/g, ''))
})
console.log(res_arr)




