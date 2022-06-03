import { useState, useEffect } from "preact/hooks";
export function CriterionText({ criterion, updateCriterion, criterionData }) {
  const [showCount, setShowCount] = useState(8);
  useEffect(() => {
    setShowCount(8);
  }, [criterionData]);
  const { q, arr = [] } = criterion;
  const queryChange = (e) => {
    updateCriterion({ ...criterion, q: e.target.value });
  };
  const addValue = (val) => {
    updateCriterion({ ...criterion, q: "", arr: [...arr, val] });
  };
  const removeValue = (val) => {
    updateCriterion({ ...criterion, q: "", arr: arr.filter((v) => v !== val) });
  };
  const filteredValues = criterionData.filter(
    ({ val }) => arr.indexOf(val) === -1
  );
  return (
    <p>
      <input type="text" value={q} onInput={queryChange} placeholder="Search" />
      {filteredValues.slice(0, showCount).map(({ val, count }) => (
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={(e) => addValue(val)}
        >
          {val + " (" + count + ")"}
        </button>
      ))}
      {filteredValues.length > showCount && (
        <>
          <i>...more options...</i>
          <button type="button" onClick={(e) => setShowCount(showCount * 2)}>
            show
          </button>
        </>
      )}
      {arr.map((val, index) => (
        <button
          style={{ marginLeft: index ? 0 : "20px" }}
          type="button"
          className="btn btn-outline-secondary"
          onClick={(e) => removeValue(val)}
        >
          {val}
        </button>
      ))}
    </p>
  );
}
