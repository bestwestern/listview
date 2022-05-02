import { useState, useEffect } from "preact/hooks";
export function CriterionNumber({ criterion, updateCriterion, criterionData }) {
  const [showCount, setShowCount] = useState(8);
  useEffect(() => {
    setShowCount(8);
  }, [criterionData]);
  const { q, rel = "eq" } = criterion;
  const updateCriterionProp = ({ prop, value }) => {
    updateCriterion({ ...criterion, [prop]: value });
  };
  return (
    <p>
      {[
        { txt: "Equals", shortName: "eq" },
        { txt: "At least", shortName: "mt" },
        { txt: "Less than (or equal to)", shortName: "lt" },
      ].map(({ txt, shortName }) => (
        <button
          type="button"
          onClick={(e) =>
            updateCriterionProp({ prop: "rel", value: shortName })
          }
          class={
            rel === shortName
              ? "btn btn-outline-primary"
              : "btn btn-outline-secondary"
          }
        >
          {txt}
        </button>
      ))}
      <input
        type="text"
        value={q}
        onInput={(e) =>
          updateCriterionProp({ prop: "q", value: e.target.value })
        }
        placeholder="Search"
      />
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
