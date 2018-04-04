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
var folderName = 'file2'

function start() {
    function onRequest(req, res) {
        console.log("started ...");
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.write("<p>" + "hellow world" + "</p>");
        var data = fs.readFileSync(folderName + '/list.json');
        summaryInfoList = JSON.parse(data)
        summaryInfoListLength = summaryInfoList.length
        console.log("搜集开始 图集总数量: " + summaryInfoListLength);
        var pageInfo = {}

        var interval = ''
        interval = setInterval(function(){
            if (count < summaryInfoListLength) {
                pageInfo = summaryInfoList[count]
                getPageInfo(pageInfo)
                count++
            } else {
                clearInterval(interval)
                console.log('搜集结束 图集总数量', pageInfoList.length)
                fs.writeFile(folderName + '/detail.json', stringify(pageInfoList))
                setTimeout(function() {
                    process.exit(); // 退出进程
                }, 5000)
            }
        }, 100)

    }

    http.createServer(onRequest).listen(5000);
}

function getPageInfo (pageInfo) {
    var requestUrl = encodeURI("http://www.nrcb3.com/Photos/showPhoto/id/" + pageInfo.id);
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
            var $imgList = $(".play img")
            var imgList = []
            console.log("此图集图片个数:", $imgList.length)
            for (var i=0; i<$imgList.length; i++) {
                var item = $imgList[i]
                imgList.push(item.attribs.src)
            }
            // type:1, http://p3.urlpic.club/picturespace/upload/image/
            // type:2, http://p.usxpic.com/imghost/upload/image/
            // type:3, http://p.vxotu.com/u/
            // type:4, http://www.nrcb3.com/
            let type = 0
            let firstImg = imgList[0]
            if (firstImg.includes('urlpic.club')) {
                type = 1
                for (let i = 0; i < imgList.length; i++) {
                    imgList[i] = imgList[i].substr(48)
                }
            } else if (firstImg.includes('p.usxpic')) {
                type = 2
                for (let j = 0; j < imgList.length; j++) {
                    imgList[j] = imgList[j].substr(41)
                }
            } else if (firstImg.includes('p.vxotu')) {
                type = 3
                for (let k = 0; k < imgList.length; k++) {
                    imgList[k] = imgList[k].substr(21)
                }
            } else if (firstImg.includes('Media/Photos')) {
                type = 4
            }

            pageInfoList.push({id: pageInfo.id, t: pageInfo.t, type: type, imgList: imgList})
            console.log()
            console.log("=================================================================")
            console.log()
        }
    )
}

exports.start = start;
