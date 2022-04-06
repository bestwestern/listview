import { useEffect, useState, useRef } from "preact/hooks";
import InlineWorker from "./worker.js?worker&inline";
import { Table } from "./table";
//import "./index.css";
const worker = new InlineWorker();
export function App({ data, url }) {
  const [selectedRows, setSelectedRows] = useState(["jklll"]);
  const [query, setQuery] = useState(
    new URL(location.href).searchParams.get("query")
  );
  const [tableData, setTableData] = useState({ headers: [], rows: [] });
  const timerRef = useRef(0);
  const didMount = useRef(false);
  const init = () => {
    console.log();
    if (url)
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network error");
          }
          return response.json();
        })
        .then((res) => {
          worker.postMessage({ data: res });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    // worker.onmessage = (ev) => {
    //   if (ev.data.tableData) setTableData(ev.data.tableData);
    // };
    window.addEventListener("popstate", function () {
      setParamsFromUrl();
      console.log("location changed!");
    });
    setParamsFromUrl();
  };
  const setParamsFromUrl = () => {
    console.log("updating params");
    const currentUrl = new URL(location.href);
    setQuery(currentUrl.searchParams.get("query"));
  };
  const updateUrl = () => {
    console.log("updating URL");
    let newUrl = window.location.origin + "/?";
    if (query.length) newUrl += "query=" + encodeURIComponent(query);
    if (location.href !== newUrl) window.history.pushState("", "", newUrl);
    //if no parameters just use location.href!
  };
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    worker.postMessage({ data });
  }, [data]);
  useEffect(() => {
    console.log({ query });
    if (didMount.current) {
      worker.postMessage({ query });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(updateUrl, 1000);
    }
    didMount.current = true;
  }, [query]);
  console.log("running");
  return (
    <>
      <input
        type="text"
        value={query}
        onInput={(e) => setQuery(e.target.value)}
        placeholder="Search"
      />
      <Table tableData={tableData}></Table>
    </>
  );
}
