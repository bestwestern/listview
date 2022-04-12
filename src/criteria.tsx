import { useState, useRef } from "preact/hooks";
import { CriterionText } from "./criteriontext";
export function CriteriaSection({
  dataTypes,
  query,
  setQuery,
  criteria,
  setCriteria,
  customCriteria,
}) {
  const [addingCriteria, setAddingCriteria] = useState(true);
  const [addingCriteriaQuery, setAddingCriteriaQuery] = useState("");
  const addCriteria = (prop, isCustom) => {
    if (isCustom) setCriteria([...criteria, { prop }]);
    else setCriteria([...criteria, { prop, q: "" }]);
  };
  const getCriteriaElement = (prop, index) => {
    const criterion = criteria[index];
    const updateCriterion = (value) =>
      setCriteria(criteria.map((c, i) => (i === index ? value : c)));
    if (Object.keys(dataTypes).length > 0) {
      if (dataTypes[prop]) {
        if (dataTypes[prop].string)
          return (
            <CriterionText
              criterion={criterion}
              updateCriterion={updateCriterion}
            ></CriterionText>
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
        <input
          type="text"
          value={query}
          onInput={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
      </p>
      {false && (
        <x-counter value={3} onvaluechange={(v) => console.log(v)}></x-counter>
      )}
      <pre>{JSON.stringify(criteria, null, 2)}</pre>
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
          </div>
        );
      })}
      <p>
        <button
          type="button"
          onClick={(e) => setAddingCriteria(!addingCriteria)}
        >
          {addingCriteria ? "Finish criteria add" : "Add critera"}
        </button>
      </p>
      {addingCriteria && (
        <div>
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
        </div>
      )}
    </div>
  );
}
