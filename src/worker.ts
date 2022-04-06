import { stringToDate } from "./util";
let dataDictionary = {};
let idsAsSorted = [];
let dataArray = [];
let currentQuery = "";
let latestRowString = "";
let searchResults = [];
let idIndex = -1;
let searchCount = 0;
let columns = [];
let dataTypes = {};
let dateProperties = {};
onmessage = function (e) {
  const { data, query } = e.data;
  if (data) analyzeData(data);
  if (query) {
    currentQuery = query;
    searchResults = [];
    searchData(++searchCount);
  }
  var workerResult = "Result: ";
  postMessage(workerResult);
};
const analyzeData = (data) => {
  const { rows, dateProps } = data;
  const dataColumns = data.columns;
  const colCount = dataColumns.length;
  console.log(dataColumns);
  dataTypes = {};
  dateProperties = {};
  for (var colIndex = 0; colIndex < colCount; colIndex++) {
    //columnPropToIndex[dataColumns[colIndex]] = colIndex;
    dataTypes[dataColumns[colIndex]] = {};
  }
  if (dataColumns) {
    columns = dataColumns;
    //data has rows property which is array of arrays. Must have a rowid property
    idIndex = columns.indexOf("rowid");
    dataArray = rows;
    for (var i = 0; i < dataArray.length; i++) {
      const row = rows[i];
      const rowId = row[idIndex];
      for (var colIndex = 0; colIndex < colCount; colIndex++) {
        let val = row[colIndex];
        const dateFormat = dateProps[dataColumns[colIndex]];
        if (dateFormat) {
          val = stringToDate(val, dateFormat);
          row[colIndex] = val;
        }
        let colType = typeof val;
        if (colType === "object" && Array.isArray(val)) colType = "array";
        if (colType === "object" && val instanceof Date) {
          dateProperties[dataColumns[colIndex]] = true;
          colType = "date";
        }
        dataTypes[dataColumns[colIndex]][colType] = true;
        dataTypes[dataColumns[colIndex]].index = colIndex;
      }
      idsAsSorted.push(rowId);
      dataDictionary[rowId] = row;
    }
    console.log(dataTypes);
    postMessage({ dataTypes });
  }
  console.log("an fini");
  searchData(++searchCount);
};
const searchData = (currentSearchCount, fromIndex = 0) => {
  if (!fromIndex)
    console.log({ currentSearchCount, searchCount, currentQuery });
  if (currentSearchCount !== searchCount) return;
  const toIndex = Math.min(idsAsSorted.length, fromIndex + 100);
  for (var rowIndex = fromIndex; rowIndex < toIndex; rowIndex++) {
    const row = dataArray[rowIndex];
    for (var columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const column = row[columnIndex];
      if (column.toString().toLowerCase().indexOf(currentQuery) > -1) {
        searchResults.push(row[idIndex]);
        break;
      }
    }
  }

  sendSearchResult(toIndex);
  if (toIndex < idsAsSorted.length)
    setTimeout(() => searchData(currentSearchCount, toIndex), 1);
};
const sendSearchResult = (toIndex: number) => {
  const rows = searchResults.map((id) => {
    let valArray = dataDictionary[id].slice(0);
    Object.keys(dateProperties).forEach((dateProp) => {
      const valIndex = dataTypes[dateProp].index;
      const date = valArray[valIndex];
      valArray[valIndex] = date.toLocaleDateString();
    });
    return valArray;
  });
  postMessage({ tableData: { rows, headers: columns }, toIndex });
};
