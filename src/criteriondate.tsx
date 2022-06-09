//import "nouislider/dist/nouislider.css";
import { SliderDate } from "./sliderdate";

export function CriterionDate({
  criterion,
  criteria,
  updateCriterion,
  criterionData,
  setCriteria,
  defaultdateformat,
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
          { txt: "After", shortName: "mt" },
          { txt: "Before", shortName: "lt" },
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
        <input
          type="text"
          value={q}
          onInput={qChange}
          placeholder={defaultdateformat
            .replaceAll(".", "")
            .replaceAll("/", "")
            .replaceAll("-", "")}
        />
      </p>
      <p
        style={{
          display: "block",
          padding: "45px",
        }}
      >
        <SliderDate
          defaultdateformat={defaultdateformat}
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
