import { useState, useRef } from "preact/hooks";
export function ColumnSettings({
  dataTypes,
  defaultdateformat,
  chosenColumns,
  setChosenColumns,
  sortedColArray,
}) {
  const [addingProp, setAddingProp] = useState(false);
  const [editingColumns, setEditingColumns] = useState(false);

  const addingInputRef = useRef(null);
  const removeColumnClick = (prop, index) => {
    setChosenColumns(chosenColumns.filter((v, i) => i !== index));
  };
  const addColumnClick = (prop) => {
    const colType = dataTypes[prop];
    if (colType.date) {
      setAddingProp({ prop, dateFormat: defaultdateformat });
      setTimeout(() => addingInputRef.current.focus(), 10);
    } else {
      setAddingProp(false);
      setChosenColumns([...chosenColumns, { prop }]);
    }
  };
  const addDateColumn = () => {
    setAddingProp(false);
    setChosenColumns([...chosenColumns, { ...addingProp }]);
  };
  const addableColumns = sortedColArray.filter(
    ({ prop }) =>
      !chosenColumns.find((chosenCol) => chosenCol.prop === prop) ||
      dataTypes[prop].date
  );
  return (
    <div>
      <p>
        <button
          type="button"
          onClick={(e) => setEditingColumns(!editingColumns)}
        >
          {editingColumns ? "Finish column edit" : "Edit columns"}
        </button>
      </p>
      {editingColumns && Object.keys(dataTypes).length === 0 && <i>loading</i>}
      {editingColumns && dataTypes && (
        <div>
          <p>
            Add columns
            {addableColumns.map(({ prop }, index) => (
              <button type="button" onClick={(e) => addColumnClick(prop)}>
                {prop}
              </button>
            ))}
          </p>
          {addingProp && (
            <p>
              <strong>
                {addingProp.prop + " er et dato-felt - angiv formatering"}
              </strong>
              <input
                type="text"
                ref={addingInputRef}
                value={addingProp.dateFormat}
                onChange={(e) =>
                  setAddingProp({ ...addingProp, dateFormat: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && addDateColumn()}
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
            {chosenColumns.map(({ prop, dateFormat }, index) => {
              let headerText = prop;
              if (dateFormat) headerText += "(" + dateFormat + ")";
              return (
                <button
                  type="button"
                  onClick={(e) => removeColumnClick(prop, index)}
                >
                  {headerText}
                </button>
              );
            })}
          </p>
        </div>
      )}
    </div>
  );
}
