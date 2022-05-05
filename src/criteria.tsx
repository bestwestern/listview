import { useState } from "preact/hooks";
import { CriterionText } from "./criteriontext";
import { CriterionNumber } from "./criterionnumber";
export function CriteriaSection({
  dataTypes,
  query,
  setQuery,
  criteria,
  setCriteria,
  customCriteria,
  criterionDataArray,
}) {
  const [addingCriteria, setAddingCriteria] = useState(false);
  const [addingCriteriaQuery, setAddingCriteriaQuery] = useState("");
  const addCriteria = (prop, isCustom) => {
    if (isCustom) setCriteria([...criteria, { prop }]);
    else setCriteria([...criteria, { prop, q: "" }]);
  };
  const getCriteriaElement = (prop, index) => {
    const criterion = criteria[index];
    const criterionData = criterionDataArray[index] || [];
    const updateCriterion = (value) =>
      setCriteria(criteria.map((c, i) => (i === index ? value : c)));
    if (Object.keys(dataTypes).length > 0) {
      if (dataTypes[prop]) {
        if (dataTypes[prop].colType === "string")
          return (
            <>
              <span>{dataTypes[prop].header}</span>
              <CriterionText
                criterion={criterion}
                updateCriterion={updateCriterion}
                criterionData={criterionData}
              ></CriterionText>
            </>
          );
        else if (dataTypes[prop].colType === "number")
          return (
            <>
              <span>{dataTypes[prop].header}</span>
              <CriterionNumber
                criterion={criterion}
                updateCriterion={updateCriterion}
                criterionData={criterionData}
              ></CriterionNumber>
            </>
          );
      } else {
        let Crit = customCriteria.find((cc) => cc.shortName === prop);
        Crit = Crit && Crit.tag;
        return (
          <Crit
            criterion={criterion}
            onupdateCriterion={({ detail }) =>
              setCriteria(
                criteria.map((c, i) =>
                  i === index ? { ...criterion, ...detail } : c
                )
              )
            }
          />
        );
        //custom
      }
    }
    return null;
  };
  return (
    <div>
      <p>
        <span>Search all columns</span>
        <input
          type="text"
          value={query}
          onInput={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
      </p>
      <hr></hr>
      {criteria.map((criterium, index) => {
        const { prop } = criterium;
        return (
          <div>
            {getCriteriaElement(prop, index)}
            <button
              type="button"
              onClick={(e) =>
                setCriteria(criteria.filter((c, i) => index !== i))
              }
            >
              Remove
            </button>
            <hr></hr>
          </div>
        );
      })}
      <p>
        <button
          type="button"
          onClick={(e) => setAddingCriteria(!addingCriteria)}
        >
          {addingCriteria ? "Finish criteria add" : "Add criteria"}
        </button>
      </p>
      {addingCriteria && (
        <>
          <span>Search property for criterion</span>{" "}
          <input
            type="text"
            value={addingCriteriaQuery}
            onInput={(e) => setAddingCriteriaQuery(e.target.value)}
            placeholder="Search"
          />
          {Object.entries(dataTypes).map(([prop, propInfo]) => {
            if (
              addingCriteriaQuery.length &&
              !propInfo.header.includes(addingCriteriaQuery)
            )
              return null;
            return (
              <button type="button" onClick={(e) => addCriteria(prop)}>
                {propInfo.header}
              </button>
            );
          })}
          <br />
          {customCriteria.map((customCriterion) => {
            const { header, shortName } = customCriterion;
            return (
              <button
                type="button"
                onClick={(e) => addCriteria(shortName, true)}
              >
                {header}
              </button>
            );
          })}
          <p />
        </>
      )}
    </div>
  );
}
