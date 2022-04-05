let dataDictionary = {};
let idsAsSorted = [];
let columnToIndexInRow = {};
let dataArray = [];
let currentQuery = "";
let latestRowString = "";
let searchResults = [];
let idIndex = -1;
let searchCount = 0;
let columns = [];
onmessage = function (e) {
  const { data, query } = e.data;
  if (data) analyzeData(data);
  if (query) {
    searchResults = [];
    console.log("startingSearch " + query);
    searchData(query, ++searchCount);
  }
  var workerResult = "Result: ";
  postMessage(workerResult);
};
const analyzeData = (data) => {
  console.log(data);
  const { rows } = data;
  const dataColumns = data.columns;
  if (dataColumns) {
    columns = dataColumns;
    //data has rows property which is array of arrays. Must have a rowid property
    idIndex = columns.indexOf("rowid");
    dataArray = rows;
    for (var i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowId = row[idIndex];
      idsAsSorted.push(rowId);
      dataDictionary[rowId] = row;
    }
    console.log(dataDictionary);
  }
};
const searchData = (query: string, currentSearchCount, fromIndex = 0) => {
  console.log({ currentSearchCount, searchCount });
  if (currentSearchCount !== searchCount) return;
  const toIndex = Math.min(idsAsSorted.length, fromIndex + 100);
  console.log("searchgin from " + fromIndex + " to " + toIndex);
  for (var rowIndex = fromIndex; rowIndex < toIndex; rowIndex++) {
    const row = dataArray[rowIndex];
    for (var columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const column = row[columnIndex];
      if (column.toString().toLowerCase().indexOf(query) > -1) {
        searchResults.push(row[idIndex]);
        break;
      }
    }
  }

  console.log({ searchResults });
  sendSearchResult(toIndex);
  if (toIndex < idsAsSorted.length)
    setTimeout(() => searchData(query, currentSearchCount, toIndex), 1);
};
const sendSearchResult = (toIndex: number) => {
  const rows = searchResults.map((id) => dataDictionary[id]);
  postMessage({ tableData: { rows, headers: columns } });
};
