var updateJson = require('./updateJSON.json');
const fs = require('fs');


// Path List 
const reqBodyPathList = '/requestBody/updateRequestBody/bodyList500KB/pathList.json';
const reqBodyPathDir = '/requestBody/updateRequestBody/bodyList500KB/';

var reqBodyPathListData = require(process.cwd() + reqBodyPathList);


const updateJsonData = updateJson.entries;

let finalPathList = [];
updateJsonData.forEach((elem, idx) => {
    const uid = elem.uid;
    const splittedArr = reqBodyPathListData[idx].split('/');
    splittedArr[splittedArr.length - 1] = uid;
    const list = splittedArr.join('/');
    // PathList Data
    //@ts-ignore
    finalPathList.push(list)

    // BodyList Data
    const bodyObj = {};
    bodyObj["entry"] = {'json_rte_1' : updateJsonData[idx]['json_rte_1']} ;
    bodyObj['entry']['json_rte_1']['attrs'] = {"dirty": true};
    fs.writeFileSync(process.cwd() + reqBodyPathDir + `${idx+1}.json`, JSON.stringify(bodyObj), 'utf-8');
})

fs.writeFileSync(process.cwd() + reqBodyPathList , JSON.stringify(finalPathList) , 'utf-8');