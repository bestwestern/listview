import { useState, useRef, useEffect } from "preact/hooks";
export function ColumnSettings({
  dataTypes,
  defaultdateformat,
  chosenColumns,
  setChosenColumns,
  sortedColArray,
}) {
  const [addingPropertySettings, setaddingPropertySettings] = useState(false);
  const [editingColumns, setEditingColumns] = useState(false);

  const removeColumnClick = (prop, index) => {
    setChosenColumns(chosenColumns.filter((v, i) => i !== index));
  };
  const addColumnClick = (prop) => {
    const dataType = dataTypes[prop];
    if (dataType.colType === "date") {
      setaddingPropertySettings({ prop, dateFormat: defaultdateformat });
    } else if (dataType.dataTypes) {
    } else if (dataType.dataTypes) {
    } else {
      setaddingPropertySettings(false);
      setChosenColumns([...chosenColumns, { prop }]);
    }
  };
  const addDateColumn = () => {
    setaddingPropertySettings(false);
    setChosenColumns([...chosenColumns, { ...addingPropertySettings }]);
  };
  const addableColumns = sortedColArray.filter(({ prop }) => {
    return (
      !chosenColumns.find((chosenCol) => chosenCol.prop === prop) ||
      dataTypes[prop].colType === "date" ||
      dataTypes[prop].colType === "array" ||
      dataTypes[prop].dataTypes
    ); //dates and arrays can be added multiple times}
  });
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
            {addableColumns.map(({ prop }, index) => {
              console.log(prop);
              return (
                <button type="button" onClick={(e) => addColumnClick(prop)}>
                  {prop}
                </button>
              );
            })}
          </p>
          {addingPropertySettings && (
            <AddingPropInProgress
              addingPropertySettings={addingPropertySettings}
              setaddingPropertySettings={setaddingPropertySettings}
              addDateColumn={addDateColumn}
            />
          )}
          <p>
            Remove chosen columns
            {chosenColumns.map(({ prop, dateFormat, format }, index) => {
              let headerText = prop;
              if (dateFormat) headerText += "(" + dateFormat + ")";
              if (format) headerText += "(" + format + ")";
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

const AddingPropInProgress = ({
  addingPropertySettings,
  setaddingPropertySettings,
  addDateColumn,
}) => {
  const addingInputRef = useRef(null);
  useEffect(() => {
    addingInputRef.current.focus();
  }, []);
  return (
    <p>
      <strong>
        {addingPropertySettings.prop + " er et dato-felt - angiv formatering"}
      </strong>
      <input
        type="text"
        ref={addingInputRef}
        value={addingPropertySettings.dateFormat}
        onChange={(e) =>
          setaddingPropertySettings({
            ...addingPropertySettings,
            dateFormat: e.target.value,
          })
        }
        onKeyDown={(e) => e.key === "Enter" && addDateColumn()}
      ></input>
      <button type="button" onClick={addDateColumn}>
        Add column
      </button>
      <span>You can use d,m,yyyy and any delimiter you want (dd,mm,yy)</span>
    </p>
  );
};
