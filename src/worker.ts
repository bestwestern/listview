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
let currentCriteriaHits = []; //currentCriteriaHits[index]=['q',3] //the activecriterias currently STOPPING dataArray[index] from being included in search
let currentCriteria = [];
let customCriteria = {};
let dateStringValuesForProps = {};
let statisticSettings = { a: 1 };
let defaultDateFormat;
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
    defaultDateFormat = defaultdateformat;
    analyzeData(data);
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
        currentCriteriaHits = [];
        searchResults = [];
        searchData(++searchCount);
      } else analyseCriteria();
    }
  }
  if (customCriterion) {
    const { shortName, fctString } = customCriterion;
    customCriteria[shortName] = JSONfn.parse(fctString);
  }
};
const analyseCriteria = () => {
  console.log("ac " + searchResults.length);
  let criterionDataArray = [];
  let activeCriterionIndex = 0;
  currentCriteria.forEach((criterion) => {
    const currentCriterionIsActive = isCriterionActive(criterion);
    let rowIdsToCheck = [...searchResults];
    if (currentCriterionIsActive) {
      currentCriteriaHits.forEach((criteriaHits, dataArrayIndex) => {
        if (
          criteriaHits.length === 1 &&
          criteriaHits[0] === activeCriterionIndex
        ) {
          rowIdsToCheck.push(dataArray[dataArrayIndex][idIndex]);
        }
      });
    }
    const { prop, q } = criterion;
    const dataType = dataTypes[prop];
    if (dataType) {
      let criterionData = {};
      const { index } = dataType;
      switch (dataType.colType) {
        case "string":
          for (var i = 0; i < rowIdsToCheck.length; i++) {
            const rowVal = dataDictionary[rowIdsToCheck[i]][index];
            criterionData[rowVal] = criterionData[rowVal]
              ? criterionData[rowVal] + 1
              : 1;
          }

          criterionDataArray.push(
            Object.entries(criterionData)
              .sort((a, b) => b[1] - a[1])
              .map((arr) => ({ val: arr[0], count: arr[1] }))
          );
          break;
        default:
          criterionDataArray.push(null);
          break;
        case "number":
          let min = false,
            max = false;
          let hasDecimalValues = false;
          for (var i = 0; i < rowIdsToCheck.length; i++) {
            const rowVal = dataDictionary[rowIdsToCheck[i]][index];
            if (rowVal % 1 !== 0) hasDecimalValues = true;
            if (min == false || min > rowVal) min = rowVal;
            if (max == false || max < rowVal) max = rowVal;
          }
          criterionDataArray.push({
            min,
            max,
            hasDecimalValues,
          });
          break;
        case "date":
          let minDate = false,
            maxDate = false;
          for (var i = 0; i < rowIdsToCheck.length; i++) {
            const rowVal = dataDictionary[rowIdsToCheck[i]][index];
            const ms = rowVal && rowVal.getTime();
            if (ms) {
              if (minDate == false || minDate > ms) minDate = ms;
              if (maxDate == false || maxDate < ms) maxDate = ms;
            }
          }
          criterionDataArray.push({
            minDate,
            maxDate,
          });
          break;
      }
    } else criterionDataArray.push(null);
    if (currentCriterionIsActive) activeCriterionIndex++;
  });
  postMessage({ criterionDataArray });
};
const getActiveCriteriaFromArray = (criteriaArray) => {
  return criteriaArray.filter(isCriterionActive);
};
const isCriterionActive = (criterion) => {
  const { prop, q, arr = [], slf, slt } = criterion;
  if (dataTypes[prop])
    switch (dataTypes[prop].colType) {
      // do switch
      case "string":
        if (q.trim().length) return true;
        if (arr.length) return true;
        break;
      case "number":
        if (q.trim().length) return true;
        if (slf !== undefined || slt !== undefined) return true;
        break;
      case "date":
        if (q.trim().length && q.trim().length === 8) return true;
        if (slf !== undefined || slt !== undefined) return true;
        break;
    }
  return false;
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
  const propIndex = dataType.index; //move to else
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
        let propValue = res.value[propIndex];

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
                // DO THIS FOR ARRAY
                //if (dateStringValuesForProps[prop] === undefined)
                //   dateStringValuesForProps[prop] = {};
                // dateStringValuesForProps[prop][res.value[idIndex]] = dateToString(
                //   propValue,
                //   "ddmmyyyy"
                // );
              }
              dataType.subColType = subColType;
            }
          } else if (colType === "object" && propValue instanceof Date) {
            colType = "date";
          }

          if (colType === "date" && indecies.length === 0) {
            //what to do when subprops are dates?!
            if (dateStringValuesForProps[prop] === undefined)
              dateStringValuesForProps[prop] = {};
            dateStringValuesForProps[prop][res.value[idIndex]] = dateToString(
              propValue,
              "ddmmyyyy"
            );
          }
          dataType.colType = colType;
        }
        if (dataType.colType != colType && colType !== "undefined")
          console.log({ prob: "flere typer!", propValue, prop });
        res = it.next();
      }
    }
};

const analyzeData = (data) => {
  const { rows } = data;

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
      const row = rows[i];
      const rowId = row[idIndex];
      idsAsSorted.push(rowId);
      dataDictionary[rowId] = row;
    }
    let sortedColArray = dataColumns.map((prop) => {
      if (dataTypes[prop] && dataTypes[prop].colType === "date")
        return { prop, dateFormat: defaultDateFormat };
      if (dataTypes[prop] && dataTypes[prop].colType === "array")
        return { prop, format: "1col" };
      if (typeof prop === "object") return { prop: Object.keys(prop)[0] };
      else return { prop };
    });

    postMessage({ dataTypes, sortedColArray });
    if (!currentChosenColumns.length)
      postMessage({
        setColumnsTo: sortedColArray.filter(
          (x) => !dataTypes[x.prop].dataTypes // don't choose subarrays as default
        ),
      });
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
    currentCriteriaHits[rowIndex] = [];
    if (currentQuery.trim().length && !doesQueryCheck(row))
      currentCriteriaHits[rowIndex].push("q");
    let activeCriteriaIndex = 0;
    while (
      currentCriteriaHits[rowIndex].length < 2 &&
      activeCriteriaIndex < currentActiveCriteria.length
    ) {
      if (
        !doesRowCheckCriteria(row, currentActiveCriteria[activeCriteriaIndex])
      )
        currentCriteriaHits[rowIndex].push(activeCriteriaIndex);
      activeCriteriaIndex++;
    }
    if (!currentCriteriaHits[rowIndex].length) searchResults.push(row[idIndex]);
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
          switch (dataType.colType) {
            case "date":
              sendValArray.push(
                dateToString(
                  valArray[dataType.index],
                  chosenColumnInfo.dateFormat
                )
              );
              break;
            case "array":
              sendValArray.push(valArray[dataType.index].join(", "));
              break;
            default:
              sendValArray.push(valArray[dataType.index]);
              break;
          }
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
const doesRowCheckCriteria = (row, criterion) => {
  if (!criterion) return true;
  const { prop, q, rel = "eq", slf, slt, arr = [] } = criterion;
  const dataType = dataTypes[prop];
  if (dataType) {
    const propValue = row[dataType.index];
    const { colType } = dataType;
    console.log(colType);
    switch (colType) {
      case "string":
        if (arr.length && !arr.includes(propValue)) return false;
        if (!propValue.toLowerCase().includes(q.toLowerCase())) return false;
        break;
      case "number":
        if (q.length) {
          switch (rel) {
            case "eq":
              if (propValue != q) return false;
              break;
            case "lt":
              if (propValue > q) return false;
              break;
            case "gt":
              if (propValue < q) return false;
              break;
          }
          return true;
        }
        let ok = true;
        if (slt !== undefined && propValue > slt) ok = false;
        if (slf !== undefined && propValue < slf) ok = false;
        return ok;
        break;
      case "date":
        if (q.length) {
          switch (rel) {
            case "eq":
              if (
                dateToString(propValue, defaultDateFormat)
                  .replaceAll(".", "")
                  .replaceAll("/", "")
                  .replaceAll("-", "") != q
              )
                return false;
              break;
            case "lt":
              if (propValue > q) return false;
              break;
            case "gt":
              if (propValue < q) return false;
              break;
          }
          return true;
        }
        let dateOk = true;
        if (slt !== undefined && propValue > slt) dateOk = false;
        if (slf !== undefined && propValue < slf) dateOk = false;
        return dateOk;
        break;
    }
    return true;
  }
  // if (customCriteria[prop]) {
  //   return !customCriteria[prop](row, criterion);
  // }
};
const doesQueryCheck = (row) => {
  return !!Object.keys(dataTypes).find((prop) =>
    queryCheckProperty(row, prop, dataTypes[prop])
  );
};
function queryCheckProperty(row, prop, dataType, indecies = []) {
  if (dataType.dataTypes) {
    return Object.keys(dataType.dataTypes).find((subProp) =>
      queryCheckProperty(row, subProp, dataType.dataTypes[subProp], [
        ...indecies,
        dataType.index,
      ])
    );
  } else {
    const propIndex = dataType.index;
    const it = makeIterator(indecies, row);
    let res = it.next();
    while (!res.done) {
      let propValue = res.value[propIndex];
      switch (dataType.colType) {
        case "number":
          return propValue.toString().indexOf(currentQuery) > -1;
          break;
        case "string":
          return propValue.toLowerCase().toString().indexOf(currentQuery) > -1;
          break;
        case "date":
          //subproperties?? indecies
          break;
        case "array":
          switch (dataType.subColType) {
            case "string":
              return propValue.find(
                (subVal) => subVal.toLowerCase().indexOf(currentQuery) > -1
              );
              break;
          }
          break;
        default:
          console.log(dataType.colType);
          break;
      }
      res = it.next();
    }
  }
}
