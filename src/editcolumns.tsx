export function EditColumns({ dataTypes, chosenColumns, setChosenColumns }) {
  let sortedArray = [];
  Object.keys(dataTypes).forEach((prop) => {
    const propProperties = dataTypes[prop];
    sortedArray[propProperties.index] = prop;
  });
  const shownChosenColumns = chosenColumns.length
    ? chosenColumns.slice(0)
    : sortedArray;
  const chosenColumnClick = (prop, index) => {
    setChosenColumns(shownChosenColumns.filter((v, i) => i !== index));
  };
  const addColumnClick = (prop) => {
    setChosenColumns([...shownChosenColumns, prop]);
  };
  return (
    <div>
      <p>
        Add columns
        {sortedArray
          .filter((prop) => shownChosenColumns.indexOf(prop) == -1)
          .map((prop, index) => (
            <button type="button" onClick={(e) => addColumnClick(prop)}>
              {prop}
            </button>
          ))}
      </p>
      <p>
        Remove chosen columns
        {shownChosenColumns.map((prop, index) => (
          <button type="button" onClick={(e) => chosenColumnClick(prop, index)}>
            {prop}
          </button>
        ))}
        <pre>{JSON.stringify(sortedArray)}</pre>
      </p>
    </div>
  );
}
