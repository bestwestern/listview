import { useState, useRef } from "preact/hooks";
export function EditColumns({
  dataTypes,
  defaultdateformat,
  chosenColumns,
  setChosenColumns,

  columnInfo,
  setColumnInfo,
}) {
  const [addingProp, setAddingProp] = useState(false);
  const addingInputRef = useRef(null);
  let sortedArray = [];
  Object.keys(dataTypes).forEach((prop) => {
    const propProperties = dataTypes[prop];
    sortedArray[propProperties.index] = prop;
  });
  const shownChosenColumns = chosenColumns.length
    ? chosenColumns.slice(0)
    : sortedArray;
  const removeColumnClick = (prop, index) => {
    setChosenColumns(shownChosenColumns.filter((v, i) => i !== index));
  };
  const addColumnClick = (prop) => {
    const colType = dataTypes[prop];
    console.log({ colType });
    if (colType.date) {
      setAddingProp({ prop, dateFormat: defaultdateformat });
      setTimeout(() => addingInputRef.current.focus(), 10);
    } else {
      setAddingProp(false);
      setChosenColumns([...shownChosenColumns, prop]);
    }
  };
  const addDateColumn = () => {
    setAddingProp(false);
    setChosenColumns([...shownChosenColumns, { ...addingProp }]);
  };
  const addableColumns = sortedArray.filter(
    (prop) => shownChosenColumns.indexOf(prop) == -1 || dataTypes[prop].date
  );
  console.log({ chosenColumns, defaultdateformat });
  return (
    <div>
      <p>
        Add columns
        {addableColumns.map((prop, index) => (
          <button type="button" onClick={(e) => addColumnClick(prop)}>
            {prop}
          </button>
        ))}
      </p>
      {addingProp && (
        <p>
          <input
            type="text"
            ref={addingInputRef}
            value={addingProp.dateFormat}
            onChange={(e) =>
              setAddingProp({ ...addingProp, dateFormat: e.target.value })
            }
          ></input>
          <button type="button" onClick={addDateColumn}>
            Add column
          </button>
          <span>
            You can use d,m,yyyy and any delimiter you want (dd,mm,yy)
          </span>
        </p>
      )}
      <p>
        Remove chosen columns
        {shownChosenColumns.map((columnObj, index) => {
          let headerText = columnObj;
          if (typeof columnObj !== "string") {
            const { prop, dateFormat } = columnObj;
            if (typeof columnObj !== "string")
              headerText = prop + "(" + dateFormat + ")";
          } else {
            if (dataTypes[columnObj].date)
              headerText += "(" + defaultdateformat + ")";
          }
          return (
            <button
              type="button"
              onClick={(e) => removeColumnClick(columnObj, index)}
            >
              {headerText}
            </button>
          );
        })}
        <pre>{JSON.stringify(sortedArray)}</pre>
      </p>
    </div>
  );
}
