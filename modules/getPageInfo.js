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
var summaryInfoList = []
var pageInfoList = []

function start() {
    function onRequest(req, res) {
        console.log("started ...");
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.write("<p>" + "hellow world" + "</p>");
        var data = fs.readFileSync('file/summaryInfoList.json');
        summaryInfoList = JSON.parse(data)
        summaryInfoListLength = summaryInfoList.length
        console.log("title 数量: " + summaryInfoListLength);
        var pageInfo = {}

        var interval = ''
        interval = setInterval(function(){
            if (count < summaryInfoListLength) {
                pageInfo = summaryInfoList[count]
                getPageInfo(pageInfo)
                count++
            } else {
                clearInterval(interval)
                console.log('pageInfo 数量', pageInfoList.length)
                fs.writeFile('file/pageInfoList.json', stringify(pageInfoList))
                setTimeout(function() {
                    process.exit(); // 退出进程
                }, 5000)
            }
        }, 2000)

    }

    http.createServer(onRequest).listen(5000);
}

function getPageInfo (pageInfo) {
    var requestUrl = encodeURI("http://www.nrcb3.com" + pageInfo.href);
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
            console.log('getPageInfo')
            var $ = cheerio.load(sres.text)
            var $imgList = $(".play img")
            var imgList = []
            console.log("$imgList.length:", $imgList.length)
            for (var i=0; i<$imgList.length; i++) {
                var item = $imgList[i]
                imgList.push(item.attribs.src)
            }
            pageInfoList.push({id: pageInfo.id, title: pageInfo.title, href: pageInfo.href, imgList: imgList})
            console.log()
            console.log("=================================================================")
            console.log()
        }
    )
}

exports.start = start;
