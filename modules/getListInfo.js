/**
 * Created by hzj 2018/04/01
 * 获取列表简要信息（list中item的id, title, url）
 */
var http = require("http");
var superagent = require("superagent");
var cheerio = require("cheerio");
var stringify = require('json-stringify');
var fs = require("fs")

var count = 0
var MAX_PAGE = 50
var summaryInfoList = []

function start() {
    function onRequest(req, res) {
        console.log("started ...");
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.write("<p>" + "hellow world" + "</p>");

        var pageNum = 1
        var interval = ''
        interval = setInterval(function(){
            if (pageNum <= MAX_PAGE) {
                getListInfo(pageNum)
                pageNum++
            } else {
                clearInterval(interval)
                console.log('title 数量', summaryInfoList.length)
                fs.writeFile('file2/summaryInfoList.json', stringify(summaryInfoList))
                setTimeout(function() {
                    process.exit(); // 退出进程
                }, 5000)
            }
        }, 1000)
    }

    http.createServer(onRequest).listen(5000);
}

function getListInfo (pageNum) {
    var requestUrl = encodeURI("http://www.nrcb3.com/Photos/showPhotosList?name=偷窥偷拍&page=" + pageNum);
    superagent.get(requestUrl)
        .set('User-Agent', "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36")
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
        .set('Accept-Encoding', 'gzip, deflate, sdch')
        .set('Cache-Control', 'no-cache')
        .set('Connection', 'keep-alive')
        .set('Upgrade-Insecure-Requests', 1)
        .end(function (err, sres) {
            if(err){
                return false;
            }
            var $ = cheerio.load(sres.text)
            var $photoList = $(".photos_list a")
            console.log("$photoList.length:", $photoList.length)
            for (var i=0; i<$photoList.length; i++) {
                var item = $photoList[i]
                let id = item.attribs.href.substr(21, 4)
                summaryInfoList.push(
                    {
                        id: id,
                        title: item.children[0].data,
                        href: item.attribs.href
                    }
                )
            }
            console.log()
            console.log("=================================================================")
            console.log()
        }
    )
}

exports.start = start;
