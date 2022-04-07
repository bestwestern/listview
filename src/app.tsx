import { useEffect, useState, useRef } from "preact/hooks";
import InlineWorker from "./worker.js?worker&inline";
import { Table } from "./table";
import { EditColumns } from "./editcolumns";
//import "./index.css";
const worker = new InlineWorker();
export function App(props) {
  const { data, url, defaultdateformat = "d.d.yyyy" } = props;
  const currentUrl = new URL(location.href);
  var col = currentUrl.searchParams.get("columns");

  var kjl = JSON.parse(col);
  console.log({ kjl });
  const [dataTypes, setDataTypes] = useState({});
  const [chosenColumns, setChosenColumns] = useState([]);
  const [columnInfo, setColumnInfo] = useState({});
  const [editingColumns, setEditingColumns] = useState(true);
  const [query, setQuery] = useState(
    currentUrl.searchParams.get("query") || ""
  );
  const [tableData, setTableData] = useState({ headers: [], rows: [] });
  const timerRef = useRef(0);
  const didMount = useRef(false);
  const init = () => {
    if (url)
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error("Network error");
          return response.json();
        })
        .then((res) => {
          worker.postMessage({ data: res });
        })
        .catch((error) => {
          throw new Error("Network error" + JSON.stringify(error));
        });
    worker.onmessage = (ev) => {
      if (ev.data.tableData) setTableData(ev.data.tableData);
      if (ev.data.dataTypes) setDataTypes(ev.data.dataTypes);
    };
    worker.postMessage({ query });
    window.addEventListener("popstate", function () {
      setParamsFromUrl();
      console.log("location changed!");
    });
  };
  const setParamsFromUrl = () => {
    console.log("updating params");
    const currentUrl = new URL(location.href);
    setQuery(currentUrl.searchParams.get("query"));
  };
  const updateUrl = () => {
    let newUrl = window.location.origin + "/?";
    if (query.length) newUrl += "&query=" + encodeURIComponent(query);
    // chosenColumns.forEach(
    //   (c, index) => (newUrl += "&c" + index + "=" + encodeURIComponent(c))
    // );
    if (chosenColumns.length)
      newUrl += "&columns=" + encodeURIComponent(JSON.stringify(chosenColumns));
    if (location.href !== newUrl) window.history.pushState("", "", newUrl);
    //if no parameters just use location.href!
  };
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (data) worker.postMessage({ data });
  }, [data]);
  useEffect(() => {
    updateUrl();
  }, [chosenColumns]);
  useEffect(() => {
    if (didMount.current) {
      worker.postMessage({ query });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(updateUrl, 1000);
    }
    didMount.current = true;
  }, [query]);
  return (
    <div>
      <p>
        <input
          type="text"
          value={query}
          onInput={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
      </p>
      <pre>{JSON.stringify(dataTypes)}</pre>
      {dataTypes && (
        <>
          <p>
            <button
              type="button"
              onClick={(e) => setEditingColumns(!editingColumns)}
            >
              {editingColumns ? "Finish column edit" : "Edit columns"}
            </button>
          </p>
          {editingColumns && (
            <EditColumns
              defaultdateformat={defaultdateformat}
              dataTypes={dataTypes}
              columnInfo={columnInfo}
              setColumnInfo={setColumnInfo}
              chosenColumns={chosenColumns}
              setChosenColumns={setChosenColumns}
            />
          )}
        </>
      )}
      <Table tableData={tableData}></Table>
    </div>
  );
}
