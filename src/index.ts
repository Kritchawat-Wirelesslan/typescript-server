import { ImainData, Mapper } from "./interface/ImainData";
import fs from "fs";
const express: any = require("express");

const app: any = express();
const mainData: any = fs.readFileSync(
  `${__dirname}\\JsonStore\\ICD10-WHO-2016.json`
);
const suggestionData: any = fs.readFileSync(
  `${__dirname}\\JsonStore\\suggestion.WHO.json`
);

var mainDataJson: any = JSON.parse(mainData);
var suggestionDataJson: any = JSON.parse(suggestionData);

type mainDataJson = {
  [key: string]: any;
};

type mapDataICD = Mapper<mainDataJson, ImainData>;

function mapDataICD(json: mainDataJson): ImainData {
  return {
    icd10: json.icd10,
    valid: json.valid,
    shortDescr: json.short_descr,
  };
}

function mapList<T, U>(mapper: Mapper<T, U>): (json: T[]) => U[] {
  return (json: T[]): U[] => {
    if (json) return json.map(mapper);
    return [];
  };
}

const mapUserList = mapList(mapDataICD);
const asyncFuncMainData: any = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mapUserList(mainDataJson)), 1000);
  });
};

const asyncFuncSuggestion: any = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(suggestionDataJson), 1000);
  });
};

app.get("/", async (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");
  const result = await asyncFuncMainData();
  res.send(result);
});

app.get("/geticd10whoall/", async (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");
  const result = await asyncFuncMainData();
  res.send(result);
});

app.get("/geticd10whoa/search/:descr", async (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5555');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  var shortDescription = req.params.descr;
  const getIcd10: any = await asyncFuncMainData();
  let filterCode = await getIcd10.filter((item: ImainData) => {
    return item.shortDescr?.toLowerCase().includes(shortDescription.toLowerCase());
  });
  await res.send(filterCode);
});

app.get("/geticd10whoa/searchConfirm/:selectedCode", async (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5555');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var confirmSelectedCode = req.params.selectedCode;
    const getIcd10: any = await asyncFuncMainData();
    let resultfilterByCode = await getIcd10.find((item: ImainData) => {
      return item.icd10?.toLowerCase() === confirmSelectedCode.toLowerCase();
    });

    let resultFilterCode: ImainData = await getMapMainDataWithSubData(resultfilterByCode);
    await res.send(resultFilterCode);
  }
);

app.use((req: any, res: any, next: any) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

app.listen(3333, () => {
  console.log("Listening on port 3333....");
});

const getMapMainDataWithSubData = async (resultfilterByCode: ImainData) => {
  if (resultfilterByCode.valid === false) {
    let newArray: any = [];
    const suggestionDataJson: any = await asyncFuncSuggestion();

    suggestionDataJson.map((item: any) => {
      let keyEnter: any = resultfilterByCode.icd10?.substring(0, 3);
      let getKeyValue: any = keyEnter.replace("'", "");
      if (item[getKeyValue])
        item[getKeyValue].map((itemResult: any) => {
          newArray.push(itemResult);
        });
    });

    let newResult: any = [];
    const getIcd10: any = await asyncFuncMainData();
    newArray.map((resultItem: any) => {
      var getMainDataJson: any = getIcd10.find((mainItem: ImainData) => {
        if (resultItem === mainItem.icd10) return mainItem;
      });
      newResult.push(getMainDataJson);
    });
    return await newResult;

  } else {

    const getIcd10: any = await asyncFuncMainData();
    return await getIcd10
      .filter((mainItem: ImainData) => {
        return mainItem.icd10 === resultfilterByCode.icd10;
      })
      .pop();
  }
};


