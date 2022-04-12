import { stringToDate, dateToString } from "./util";
import { JSONfn } from "./jsonfn";
let dataDictionary = {};
let idsAsSorted = [];
let dataArray = [];
let currentQuery = "";
let currentChosenColumns = [];
let searchResults = [];
let idIndex = -1;
let searchCount = 0;
let columns = [];
let dataTypes = {};
let dateProperties = {};
let columnHeaders = {};
let currentActiveCriteria = false;
let currentCriteria = [];
let customCriteria = {};
onmessage = function (e) {
  const {
    data,
    query,
    chosenColumns,
    defaultdateformat,
    criteria,
    customCriterion,
  } = e.data;
  if (data) {
    console.log(data);
    analyzeData(data, defaultdateformat);
  }
  if (query !== undefined && query !== currentQuery) {
    currentQuery = query || "";
    searchResults = [];
    searchData(++searchCount);
  }
  if (chosenColumns) {
    currentChosenColumns = chosenColumns;
    sendSearchResult(dataArray.length);
  }
  if (criteria) {
    if (!Object.keys(dataTypes).length) {
      currentCriteria = criteria;
    } else {
      let newActiveCriteria = getActiveCriteriaFromArray(criteria);
      if (
        JSON.stringify(currentActiveCriteria) !==
        JSON.stringify(newActiveCriteria)
      ) {
        currentActiveCriteria = newActiveCriteria;
        searchResults = [];
        searchData(++searchCount);
      }
    }
  }
  if (customCriterion) {
    const { shortName, fctString } = customCriterion;
    customCriteria[shortName] = JSONfn.parse(fctString);
  }
};
const getActiveCriteriaFromArray = (criteriaArray) => {
  return criteriaArray.filter((criterion) => {
    const { prop, q } = criterion;
    if (dataTypes[prop]) {
      if (dataTypes[prop].string) {
        if (q.trim().length) return true;
      }
    }
    return true;
  });
};
const analyzeData = (data, defaultdateformat) => {
  const { rows, dateProps } = data;
  columnHeaders = data.columnHeaders || {};
  const dataColumns = data.columns;
  const colCount = dataColumns.length;
  dataTypes = {};
  dateProperties = {};
  for (var colIndex = 0; colIndex < colCount; colIndex++) {
    //columnPropsearchToIndex[dataColumns[colIndex]] = colIndex;
    const c = dataColumns[colIndex];
    dataTypes[c] = { header: columnHeaders[c] || c };
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
    let sortedColArray = dataColumns.map((prop) => {
      if (dataTypes[prop].date) return { prop, dateFormat: defaultdateformat };
      else return { prop };
    });
    postMessage({ dataTypes, sortedColArray });
    if (!currentChosenColumns.length)
      postMessage({ setColumnsTo: sortedColArray });
  }
  if (!currentActiveCriteria)
    currentActiveCriteria = getActiveCriteriaFromArray(currentCriteria);
  searchData(++searchCount);
};
const searchData = (currentSearchCount, fromIndex = 0) => {
  if (!fromIndex) if (currentSearchCount !== searchCount) return;
  const searchToIndex = Math.min(idsAsSorted.length, fromIndex + 100);
  for (var rowIndex = fromIndex; rowIndex < searchToIndex; rowIndex++) {
    const row = dataArray[rowIndex];
    if (!currentQuery.trim().length || doesQueryCheck(row)) {
      if (doesRowCheckCriteria(row)) searchResults.push(row[idIndex]);
    }
  }

  sendSearchResult(searchToIndex);
  if (searchToIndex < idsAsSorted.length)
    setTimeout(() => searchData(currentSearchCount, searchToIndex), 100);
};
const sendSearchResult = (searchToIndex: number) => {
  if (currentChosenColumns.length) {
    const rows = searchResults.map((id) => {
      let valArray = dataDictionary[id].slice(0);
      let sendValArray = [];
      for (
        var chosenColumnIndex = 0;
        chosenColumnIndex < currentChosenColumns.length;
        chosenColumnIndex++
      ) {
        const chosenColumnInfo = currentChosenColumns[chosenColumnIndex];
        const dataType = dataTypes[chosenColumnInfo.prop];
        if (dataType.date)
          sendValArray.push(
            dateToString(valArray[dataType.index], chosenColumnInfo.dateFormat)
          );
        else sendValArray.push(valArray[dataType.index]);
      }
      return sendValArray;
    });
    postMessage({
      tableData: {
        rows,
        headers: currentChosenColumns.map(
          ({ prop }) => columnHeaders[prop] || prop
        ),
        searchToIndex,
      },
    });
  } else postMessage({ tableData: { rows: [], headers: [], searchToIndex } });
};
const doesRowCheckCriteria = (row) => {
  const firstCriterionNotChecked = currentActiveCriteria.find((criterion) => {
    if (!criterion) return false;
    const { prop, q } = criterion;
    const dataType = dataTypes[prop];
    if (dataType) {
      const propValue = row[dataType.index];
      if (dataType.string && !propValue.toLowerCase().includes(q.toLowerCase()))
        return true;
    }
    if (customCriteria[prop]) {
      return !customCriteria[prop](row, criterion);
    }
  });
  return !firstCriterionNotChecked;
};
const doesQueryCheck = (row) => {
  for (var columnIndex = 0; columnIndex < row.length; columnIndex++) {
    const column = row[columnIndex];
    if (column.toString().toLowerCase().indexOf(currentQuery) > -1) {
      return true;
    }
  }
  return false;
};
