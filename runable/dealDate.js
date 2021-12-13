const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
workbook.creator = 'One of the best';
workbook.lastModifiedBy = 'One of the best';
workbook.created = new Date(2021, 8, 7);
const worksheet = workbook.addWorksheet('game');
let monent = require('moment')


// let a = '巴西甲-乔沛高恩斯SC(主)0-1(0-0)完利斯菲体育会PE'.substring(0, 29) + '-X' //7
// console.log(a.length)


let str = '丹麦杯[2]\n' +
   '日皇杯[2]\n' +
   '罗甲[2]\n' +
   '超[4]\n' +
   '西甲[4]\n' +
   '德甲[2]\n' +
   '意甲[5]\n' +
   '法甲[7]\n' +
   '中超附[4]\n' +
   '意乙[3]\n' +
   '德乙[3]\n' +
   '西乙[4]\n' +
   '比甲[4]\n' +
   '苏超[2]\n' +
   '葡超[4]\n' +
   '荷甲[5]\n' +
   '俄超[4]\n' +
   '奥甲[3]\n' +
   '瑞士超[3]\n' +
   '希腊超[2]\n' +
   '挪超[8]\n' +
   '阿甲[4]\n' +
   '韩K联附[1]\n' +
   '波兰超[3]\n' +
   '捷甲[4]\n' +
   '土超[3]\n' +
   '澳洲甲[1]\n' +
   '保超[2]'


let arr = str.split('\n')
let res_arr = []
arr.map((d,i)=>{
    res_arr.push(d.replace(/\[\d*\]/g, ''))
})
console.log(res_arr)




