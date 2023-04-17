import { useState } from "preact/hooks";
import { CriterionText } from "./criteriontext";
import { CriterionNumber } from "./criterionnumber";
import { CriterionDate } from "./criteriondate";
export function CriteriaSection({
  dataTypes,
  query,
  setQuery,
  criteria,
  setCriteria,
  customCriteria,
  criterionDataArray,
  setCriterionDataArray,
  defaultdateformat,
}) {
  const [addingCriteria, setAddingCriteria] = useState(false);
  const [addingCriteriaQuery, setAddingCriteriaQuery] = useState("");
  const addCriteria = (prop, isCustom) => {
    if (isCustom) setCriteria([...criteria, { prop }]);
    else setCriteria([...criteria, { prop, q: "" }]);
  };
  const updateCriterion = (index, value) => {
    let cr = criteria;
    cr = cr.map((c, i) => (i === index ? value : c));
    setCriteria(cr);
  };
  const getCriteriaElement = (prop, index) => {
    const criterion = criteria[index];
    const criterionData = criterionDataArray[index] || [];
    if (Object.keys(dataTypes).length > 0) {
      if (dataTypes[prop]) {
        switch (dataTypes[prop].colType) {
          case "string":
            return (
              <>
                <span>{dataTypes[prop].header}</span>
                <CriterionText
                  criterion={criterion}
                  updateCriterion={updateCriterion.bind(this, index)}
                  criterionData={criterionData}
                ></CriterionText>
              </>
            );
          case "number":
            return (
              <>
                <span>{dataTypes[prop].header}</span>
                {criterionData && criterionData.max !== undefined && (
                  <CriterionNumber
                    criterion={criterion}
                    updateCriterion={updateCriterion.bind(this, index)}
                    criterionData={criterionData}
                    criteria={criteria}
                    setCriteria={setCriteria}
                    criteriaIndex={index}
                  ></CriterionNumber>
                )}
              </>
            );
          case "date":
            return (
              <>
                <span>{dataTypes[prop].header}</span>
                {criterionData && criterionData.maxDate !== undefined && (
                  <CriterionDate
                    criterion={criterion}
                    defaultdateformat={defaultdateformat}
                    updateCriterion={updateCriterion.bind(this, index)}
                    criterionData={criterionData}
                    criteria={criteria}
                    setCriteria={setCriteria}
                    criteriaIndex={index}
                  ></CriterionDate>
                )}
              </>
            );
        }
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
              onClick={(e) => {
                setCriterionDataArray(
                  criterionDataArray.filter((a, i) => i !== index)
                );
                setCriteria(criteria.filter((c, i) => i !== index));
              }}
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
