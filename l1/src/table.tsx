import { ProgressBar } from "./progressbar";

export function Table({
  tableData = { headers: [], rows: [], searchToIndex: 0 },
  rowCount,
}) {
  const { headers, rows, searchToIndex } = tableData;
  const searchedPercentage = (100 * searchToIndex) / rowCount;
  //const foundPercentage = (100 * table) / rowCount;
  return (
    <div>
      <pre>
        {1 &&
          JSON.stringify({ rowCount, searchToIndex, rowslength: rows.length })}
      </pre>
      <ProgressBar searchedPercentage={searchedPercentage} />
      <table class="table table-striped ">
        <thead class="table-dark sticky-top">
          <tr>
            {headers
              .filter((header) => {
                return typeof header === "string";
              })
              .map((header) => (
                <th scope="col">{header} </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((rowArray) => (
            <tr scope="row">
              {rowArray.map((cell) => (
                <td>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
