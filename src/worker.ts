import { stringToDate, dateToString } from "./util";
import { JSONfn } from "./jsonfn";
import {
  min,
  max,
  mean,
  standardDeviation,
  linearRegression,
} from "simple-statistics";
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
let dateStringValuesForProps = {};
let statisticSettings = { a: 1 };
onmessage = function (e) {
  const {
    data,
    query,
    chosenColumns,
    defaultdateformat,
    criteria,
    customCriterion,
    statSettings,
  } = e.data;
  if (statSettings) {
    statisticSettings = statSettings;
    makeSimpleStat();
  }
  if (data) {
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
    currentCriteria = criteria;
    if (Object.keys(dataTypes).length) {
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
const analyseCriteria = () => {
  let criterionDataArray = [];
  currentCriteria.forEach((criterion) => {
    const { prop, q } = criterion;
    const dataType = dataTypes[prop];
    if (dataType) {
      if (dataType.colType === "string") {
        let criterionData = {};
        const { index } = dataType;
        for (var i = 0; i < searchResults.length; i++) {
          const rowVal = dataDictionary[searchResults[i]][index];
          criterionData[rowVal] = criterionData[rowVal]
            ? criterionData[rowVal] + 1
            : 1;
        }

        criterionDataArray.push(
          Object.entries(criterionData)
            .sort((a, b) => b[1] - a[1])
            .map((arr) => ({ val: arr[0], count: arr[1] }))
        );
      }
    } else criterionDataArray.push(null);
  });
  postMessage({ criterionDataArray });
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
const createHeaders = (dataColumns, indecies = []) => {
  let currentDataColumns = dataColumns;
  for (var i = 0; i < indecies.length; i++)
    currentDataColumns = Object.values(currentDataColumns[indecies[i]])[0];
  let newDataTypeObject = {};
  for (var colIndex = 0; colIndex < currentDataColumns.length; colIndex++) {
    const c = currentDataColumns[colIndex];
    if (typeof c === "string") {
      newDataTypeObject[c] = {
        header: currentDataColumns[c] || c,
        index: colIndex,
      };
    } else {
      const prop = Object.keys(c)[0];
      newDataTypeObject[prop] = {
        index: colIndex,
        header: prop,
      };
      newDataTypeObject[prop].dataTypes = createHeaders(dataColumns, [
        ...indecies,
        colIndex,
      ]);
    }
  }
  return newDataTypeObject;
};

function makeIterator(indecies, row) {
  let currentIndecies = new Array(indecies.length).fill(0);
  let currentLengths = new Array(indecies.length).fill(0);
  let cont = true;
  const rangeIterator = {
    next() {
      let result;
      if (cont) {
        let returnRow = row;
        for (var i = 0; i < indecies.length; i++) {
          if (!returnRow) return { value: undefined, done: true };
          const subArray = returnRow[indecies[i]];
          currentLengths[i] = subArray.length;
          returnRow = subArray[currentIndecies[i]];
        }
        result = { value: returnRow, done: returnRow == undefined };
        cont = false;
        if (indecies.length)
          for (var i = indecies.length - 1; i >= 0; i--) {
            if (currentIndecies[i] < currentLengths[i] - 1) {
              currentIndecies[i] = currentIndecies[i] + 1;
              cont = true;
              break;
            } else currentIndecies[i] = 0;
          }
        return result;
      }
      return { value: false, done: true };
    },
  };
  return rangeIterator;
}

const addDataTypes = (prop, dataType, indecies = []) => {
  console.log(prop);
  const propIndex = dataType.index;
  if (dataType.dataTypes) {
    Object.keys(dataType.dataTypes).forEach((subProp) =>
      addDataTypes(subProp, dataType.dataTypes[subProp], [
        ...indecies,
        dataType.index,
      ])
    );
  } else
    for (var rowIndex = 0; rowIndex < dataArray.length; rowIndex++) {
      let subRow = dataArray[rowIndex];
      const it = makeIterator(indecies, subRow);
      let res = it.next();
      while (!res.done) {
        const propValue = res.value[propIndex];
        //if (prop === "Relation") console.log(propValue, subRow);
        let colType = typeof propValue;
        if (colType === "undefined") dataType.hasNullValues = true;
        else {
          if (colType === "object" && Array.isArray(propValue)) {
            colType = "array";
            //array of simple objects
            for (
              var subRowIndex = 0;
              subRowIndex < propValue.length;
              subRowIndex++
            ) {
              const supPropValue = propValue[subRowIndex];
              let subColType = typeof supPropValue;
              if (subColType === "object" && supPropValue instanceof Date) {
                subColType = "date";
              }
              dataType.subColType = subColType;
            }
          } else if (colType === "object" && propValue instanceof Date) {
            colType = "date";
          }
          dataType.colType = colType;
        }
        if (dataType.colType != colType && colType !== "undefined")
          console.log({ prob: "flere typer!", propValue, prop });
        res = it.next();
      }
    }
};

const analyzeData = (data, defaultdateformat) => {
  console.log({ data });
  const { rows, dateProps } = data;
  columnHeaders = data.columnHeaders || {};
  const dataColumns = data.columns;
  const colCount = dataColumns.length;
  dataTypes = {};
  dateProperties = {};
  // for (var colIndex = 0; colIndex < colCount; colIndex++) {
  //   //columnPropsearchToIndex[dataColumns[colIndex]] = colIndex;
  //   const c = dataColumns[colIndex];
  //   if (typeof c === "string") dataTypes[c] = { header: columnHeaders[c] || c };
  // }
  let columnsWithMultipleTypes = {};
  if (dataColumns && rows.length) {
    columns = dataColumns;
    dataArray = rows;
    dataTypes = createHeaders(dataColumns);
    //data has rows property which is array of arrays. Must have a rowid property
    idIndex = columns.indexOf("rowid");
    Object.keys(dataTypes).forEach((prop) =>
      addDataTypes(prop, dataTypes[prop])
    );
    console.log(dataTypes);
    for (var i = 0; i < dataArray.length; i++) {
      break;
      const row = rows[i];
      const rowId = row[idIndex];
      for (var colIndex = 0; colIndex < colCount; colIndex++) {
        let val = row[colIndex];
        const columnProp = dataColumns[colIndex];
        const dateFormat = dateProps[columnProp];
        if (dateFormat) {
          val = stringToDate(val, dateFormat);
          row[colIndex] = val;
        }
        let colType = typeof val;
        if (colType === "object" && Array.isArray(val)) colType = "array";
        else if (colType === "object" && val instanceof Date) {
          dateProperties[columnProp] = true;
          if (dateStringValuesForProps[columnProp] === undefined)
            dateStringValuesForProps[columnProp] = {};
          dateStringValuesForProps[columnProp][rowId] = dateToString(
            val,
            "ddmmyyyy"
          );
          colType = "date";
        }
        if (typeof columnProp === "string")
          if (dataTypes[columnProp].colType) {
            dataTypes[columnProp].index = colIndex;
            if (dataTypes[columnProp].colType !== colType)
              columnsWithMultipleTypes[columnProp] = [
                colType,
                dataTypes[columnProp].colType,
              ];
          } else dataTypes[columnProp].colType = colType;
        //        dataTypes[columnProp][colType] = true;
      }
      idsAsSorted.push(rowId);
      dataDictionary[rowId] = row;
    }
    let sortedColArray = dataColumns.map((prop) => {
      if (dataTypes[prop] && dataTypes[prop].colType === "date")
        return { prop, dateFormat: defaultdateformat };
      else return { prop };
    });
    postMessage({ dataTypes, sortedColArray });
    if (!currentChosenColumns.length)
      postMessage({ setColumnsTo: sortedColArray });
  }
  if (Object.keys(columnsWithMultipleTypes).length)
    postMessage({ columnsWithMultipleTypes });
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
    setTimeout(() => searchData(currentSearchCount, searchToIndex), 50);
  else {
    analyseCriteria();
    //if (Object.keys(statisticSettings).length)
    makeSimpleStat();
  }
};
const makeSimpleStat = () => {
  console.log("mak stat");
  const { lr, s } = statisticSettings;
  if (!s) return;
  console.log("yes!");
  let statData = {
    headers: ["Property", "Mean", "Min", "Max", "Std dev."],
    rows: [],
  };
  let propValues = {};
  if (Object.keys(dataTypes).length) {
    for (var prop in dataTypes) {
      const dt = dataTypes[prop]; //datatype
      if (dt)
        if (dt.colType === "number") {
          propValues[prop] = [];
          for (var i = 0; i < searchResults.length; i++)
            propValues[prop].push(dataDictionary[searchResults[i]][dt.index]);
          console.log(propValues);
          if (propValues[prop].length)
            statData.rows.push([
              dt.header,
              mean(propValues[prop]).toFixed(2),
              min(propValues[prop]),
              max(propValues[prop]),
              standardDeviation(propValues[prop]).toFixed(2),
            ]);
        }
    }
    if (statisticSettings.lr) {
      const explainingProperty = Object.keys(statisticSettings.lr)[0];
      const dependantProperty = statisticSettings.lr[explainingProperty];
      const explValues = propValues[explainingProperty];
      const depValues = propValues[dependantProperty];
      console.log({ explValues, depValues });
      const dataPoints = depValues.map((dep, index) => [
        explValues[index],
        dep,
      ]);
      statData.lr = linearRegression(dataPoints);
      statData.lr.m = statData.lr.m.toFixed(2);
      statData.lr.b = statData.lr.b.toFixed(2);
    }
    postMessage({ statData });
  }
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
        if (dataType && dataType.colType)
          if (dataType.colType === "date")
            sendValArray.push(
              dateToString(
                valArray[dataType.index],
                chosenColumnInfo.dateFormat
              )
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
      if (
        dataType.colType === "string" &&
        !propValue.toLowerCase().includes(q.toLowerCase())
      )
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
    const columnProp = columns[columnIndex];
    if (!columnProp) return false;
    if (dataTypes[columnProp].colType === "date") {
      if (
        dateStringValuesForProps[columnProp][row[idIndex]].indexOf(
          currentQuery
        ) > -1
      )
        return true;
    } else {
      const column = row[columnIndex];
      if (column.toString().toLowerCase().indexOf(currentQuery) > -1) {
        return true;
      }
    }
  }
  return false;
};
