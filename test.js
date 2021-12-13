try {
    if (1) {
         throw ('没有数据')
    }
} catch (e) {
    console.log(e)
    if(e=='没有数据'){
        console.log(1111)
    }

}
