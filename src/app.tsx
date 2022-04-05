import { useEffect, useState } from "preact/hooks";
import InlineWorker from "./worker.js?worker&inline";
import { Table } from "./table";
//import "./index.css";
const worker = new InlineWorker();
export function App({ data, url }) {
  const [selectedRows, setSelectedRows] = useState(["jklll"]);
  const [query, setQuery] = useState("");
  const [tableData, setTableData] = useState({ headers: [], rows: [] });
  const init = () => {
    console.log("init");
    if (url)
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network error");
          }
          return response.json();
        })
        .then((res) => {
          console.log({ res });
          worker.postMessage({ data: res });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    worker.onmessage = (ev) => {
      console.log({ ev });
      if (ev.data.tableData) setTableData(ev.data.tableData);
    };
  };
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    worker.postMessage({ data });
  }, [data]);
  useEffect(() => {
    worker.postMessage({ query });
  }, [query]);
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
