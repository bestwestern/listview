import { Logo } from "./logo";
import { useEffect, useState } from "preact/hooks";
import InlineWorker from "./worker.js?worker&inline";
const worker = new InlineWorker();
export function App({ data, url }) {
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
    };
  };
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    worker.postMessage({ data });
  }, [data]);
  const [selectedRows, setSelectedRows] = useState(["jklll"]);
  return (
    <>
      <Logo />
      <pre>{JSON.stringify(selectedRows)}</pre>
      <p>Hello Vite + Preact!</p>
      <p>
        <button
          type="button"
          onClick={(e) => setSelectedRows([...selectedRows, "jkl"])}
        >
          addrws
        </button>
        <a
          class="link"
          href="https://preactjs.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Preacts
        </a>
      </p>
    </>
  );
}
