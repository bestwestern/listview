import { useEffect, useState, useRef } from "preact/hooks";
import InlineWorker from "./worker.js?worker&inline";
import { Table } from "./table";
import { ColumnSettings } from "./columnsettings";
import { CriteriaSection } from "./criteria";
import { JSONfn } from "./jsonfn";
//import "./index.css";
const worker = new InlineWorker();
export function App(props) {
  const {
    data,
    url,
    defaultdateformat = "d.m.yyyy",
    customCriteria = [],
  } = props;
  const currentUrl = new URL(location.href);
  const [dataTypes, setDataTypes] = useState({});
  const [sortedColArray, setsortedColArray] = useState([]);
  //const [customCriteria, setCustomCriteria] = useState([]);
  const [chosenColumns, setChosenColumns] = useState(
    JSON.parse(currentUrl.searchParams.get("columns")) || []
  );
  const [criteria, setCriteria] = useState(
    JSON.parse(currentUrl.searchParams.get("criteria")) || []
  );
  const [criterionDataArray, setCriterionDataArray] = useState([]);
  const [count, setCount] = useState(0);
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
          setCount(res.data.length);
        })
        .catch((error) => {
          throw new Error("Network error" + JSON.stringify(error));
        });
    worker.onmessage = (ev) => {
      if (ev.data.tableData) setTableData(ev.data.tableData);
      if (ev.data.dataTypes) {
        setDataTypes(ev.data.dataTypes);
        setsortedColArray(ev.data.sortedColArray);
      }
      if (ev.data.setColumnsTo) {
        setChosenColumns(ev.data.setColumnsTo);
      }
      if (ev.data.criterionDataArray) {
        setCriterionDataArray(ev.data.criterionDataArray);
      }
    };
    worker.postMessage({ query });
    window.addEventListener("popstate", function () {
      setParamsFromUrl();
    });
  };
  const setParamsFromUrl = () => {
    const currentUrl = new URL(location.href);
    setQuery(currentUrl.searchParams.get("query") || "");
    const columnQuery = currentUrl.searchParams.get("columns");
    setChosenColumns(columnQuery ? JSON.parse(columnQuery) : []);
    const criteraQuery = currentUrl.searchParams.get("criteria");
    setCriteria(criteraQuery ? JSON.parse(criteraQuery) : []);
    //setChosenColumns(columnQuery ? JSON.parse(columnQuery) : sortedColArray);
  };
  const updateUrl = () => {
    let newUrl = window.location.origin + "/?";
    if (query.length) newUrl += "&query=" + encodeURIComponent(query);
    if (criteria.length)
      newUrl += "&criteria=" + encodeURIComponent(JSON.stringify(criteria));
    newUrl += "&columns=" + encodeURIComponent(JSON.stringify(chosenColumns));
    if (location.href !== newUrl) window.history.pushState("", "", newUrl);
  };
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (data) {
      worker.postMessage({ data, defaultdateformat });
      setCount(data.rows.length);
    }
  }, [data]);
  useEffect(() => {
    updateUrl();
    worker.postMessage({ chosenColumns });
  }, [chosenColumns]);
  useEffect(() => {
    updateUrl();
    setCriterionDataArray([]);
    worker.postMessage({ criteria });
  }, [criteria]);
  useEffect(() => {
    customCriteria.forEach(({ shortName, filter }) =>
      worker.postMessage({
        customCriterion: { shortName, fctString: JSONfn.stringify(filter) },
      })
    );
  }, [customCriteria]);
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
      <a href={window.location.origin}>reset</a>
      <CriteriaSection
        dataTypes={dataTypes}
        setQuery={setQuery}
        query={query}
        criteria={criteria}
        setCriteria={setCriteria}
        criterionDataArray={criterionDataArray}
        customCriteria={customCriteria}
      />
      <ColumnSettings
        defaultdateformat={defaultdateformat}
        dataTypes={dataTypes}
        sortedColArray={sortedColArray}
        chosenColumns={chosenColumns}
        setChosenColumns={setChosenColumns}
      />

      <Table tableData={tableData} rowCount={count}></Table>
    </div>
  );
}
