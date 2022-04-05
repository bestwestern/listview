export function Table({ tableData = { headers: ["t"], rows: [["jkl"]] } }) {
  const { headers, rows } = tableData;
  return (
    <table>
      <thead>
        <tr>
          {headers.map((header) => (
            <th>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 250).map((rowArray) => (
          <tr>
            {rowArray.map((cell) => (
              <td>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
