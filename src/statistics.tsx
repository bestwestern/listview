import { useState } from "preact/hooks";
export function Statistics({
  statData,
  dataTypes,
  statisticsSettings,
  SetStatisticsSettings,
}) {
  const { headers = [], rows = [] } = statData;
  const [explainingProperty, setExplainingProperty] = useState("");
  const numberColumns = Object.entries(dataTypes)
    .filter(([prop, dataType]) => dataType.colType === "number")
    .map(([prop]) => prop);
  const { lr, s } = statisticsSettings;
  return (
    <div>
      <p>
        <button
          type="button"
          onClick={(e) =>
            SetStatisticsSettings({ ...statisticsSettings, s: 1 - s })
          }
        >
          {s ? "Hide statistics" : "Show statistics"}
        </button>
      </p>
      {s > 0 && (
        <>
          <table class="table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th scope="col">{header} </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((rowArray) => (
                <tr scope="row">
                  {rowArray.map((cell) => (
                    <td>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {numberColumns.length > 1 && (
            <>
              <h5>
                Linear regression - explain/calculate on property with another
              </h5>
              <p>
                {explainingProperty ? (
                  <>
                    <span>Using</span>
                    <strong>{" " + explainingProperty + " "}</strong>
                    <span>to explain</span>
                    {lr ? (
                      <>
                        <strong>{" " + Object.values(lr)[0] + ":"}</strong>
                        {statData.lr && (
                          <p>
                            {explainingProperty +
                              "*" +
                              statData.lr.m +
                              (statData.lr.b < 0
                                ? " " + statData.lr.b
                                : " + " + statData.lr.b)}
                          </p>
                        )}
                      </>
                    ) : (
                      numberColumns
                        .filter((prop) => prop !== explainingProperty)
                        .map((prop) => (
                          <button
                            type="button"
                            onClick={(e) =>
                              SetStatisticsSettings({
                                ...statisticsSettings,
                                lr: { [explainingProperty]: prop },
                              })
                            }
                          >
                            {dataTypes[prop].header}
                          </button>
                        ))
                    )}
                  </>
                ) : (
                  <>
                    <span>Use this property</span>
                    {numberColumns.map((prop) => (
                      <button
                        type="button"
                        onClick={(e) => setExplainingProperty(prop)}
                      >
                        {dataTypes[prop].header}
                      </button>
                    ))}
                  </>
                )}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
