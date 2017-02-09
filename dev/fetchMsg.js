/**
 * Created by lchysh on 14-12-9.
 */
var http = require('http');
http.get('http://www.naichabiao.com?a=12121', function(res){
    //if(err){
    //
    //    return;
    //}
    console.log(res.headers);
    console.log(new Date(res.headers['last-modified']));
    var strs = [];
    res.on('data', function(data){
        strs.push(data.toString())
    });
    res.on('end', function(){
        console.log(strs.join(''));
    });
})