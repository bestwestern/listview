import { useState, useEffect } from "preact/hooks";
export function CriterionText({ criterion, updateCriterion, criterionData }) {
  const [showCount, setShowCount] = useState(8);
  useEffect(() => {
    setShowCount(8);
  }, [criterionData]);
  const { q } = criterion;
  const queryChange = (e) => {
    updateCriterion({ ...criterion, q: e.target.value });
  };
  return (
    <p>
      <input type="text" value={q} onInput={queryChange} placeholder="Search" />
      {criterionData.slice(0, showCount).map(({ val, count }) => (
        <button type="button">{val + " (" + count + ")"}</button>
      ))}
      {criterionData.length > showCount && (
        <>
          <i>...more options...</i>
          <button type="button" onClick={(e) => setShowCount(showCount * 2)}>
            show
          </button>
        </>
      )}
    </p>
  );
}
