//import "nouislider/dist/nouislider.css";
import { Slider } from "./slidernumber";

export function CriterionNumber({
  criterion,
  criteria,
  updateCriterion,
  criterionData,
  setCriteria,
  criteriaIndex,
}) {
  const { q, rel = "eq" } = criterion; //slf=sliderFrom, slt=sliderTo
  const updateCriterionProp = (obj) => {
    updateCriterion({ ...criterion, ...obj });
  };
  const qChange = (e) => {
    let newCriterion = { ...criterion };
    delete newCriterion.slf;
    delete newCriterion.slt;
    newCriterion.q = e.target.value;
    updateCriterion(newCriterion);
  };
  return (
    <>
      <p>
        {[
          { txt: "Equals", shortName: "eq" },
          { txt: "At least", shortName: "mt" },
          { txt: "Less than (or equal to)", shortName: "lt" },
        ].map(({ txt, shortName }) => (
          <button
            type="button"
            onClick={(e) => updateCriterionProp({ rel: shortName })}
            class={
              rel === shortName
                ? "btn btn-outline-primary"
                : "btn btn-outline-secondary"
            }
          >
            {txt}
          </button>
        ))}
        <input type="text" value={q} onInput={qChange} />
      </p>
      <p
        style={{
          display: "block",
          padding: "30px",
        }}
      >
        <Slider
          criterionData={criterionData}
          criterion={criterion}
          criteria={criteria}
          setCriteria={setCriteria}
          criteriaIndex={criteriaIndex}
        />
      </p>
    </>
  );
}
