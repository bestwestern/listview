import { useState, useEffect, useRef, useMemo } from "preact/hooks";
import wnumb from "wnumb";
//import "nouislider/dist/nouislider.css";
import { Slider } from "./slider";

export function CriterionNumber({
  criterion,
  criteria,
  updateCriterion,
  criterionData,
  setCriteria,
  criteriaIndex,
}) {
  // const slider = useMemo(
  //   () => makeSlider(min, max, hasDecimalValues),
  //   [min, max, hasDecimalValues]
  // );
  // console.log(criterionData);
  const { q, rel = "eq", slf, slt } = criterion; //slf=sliderFrom, slt=sliderTo
  // useEffect(() => {
  //   var slider = sliderRef.current;
  //   noUiSlider.create(slider, {
  //     start: [slf || 0, slt || 0],
  //     connect: true,
  //     tooltips: wnumb({ decimals: 0 }),
  //     range: {
  //       min: 0,
  //       max,
  //     },
  //     step: 1,
  //     format: {
  //       to,
  //       from,
  //     },
  //   });
  //   slider.noUiSlider.on("end", (val) => {
  //     let [newFrom, newTo] = val;
  //     if (!hasDecimalValues) {
  //       newFrom = Math.round(newFrom);
  //       newTo = Math.round(newTo);
  //     }
  //     updateCriterion({ ...criterion, slf: newFrom, slt: newTo });
  //   });
  // }, []);
  // useEffect(() => {
  //   var slider = sliderRef.current;
  //   console.log({ min, max });
  //   // if (slf!==undefined||slt!==undefined){
  //   //   let newSlf
  //   //   if (slf!==undefined)
  //   // }
  //   slider.noUiSlider.updateOptions(
  //     { range: { min, max } },
  //     false // Boolean 'fireSetEvent'
  //   );
  //   // const newMin = Math.max([min, slf]);
  //   // slider.noUiSlider.set([newMin, max]);
  // }, [min, max]);
  // useEffect(() => {
  //   slider.noUiSlider.set([min, max]);
  // }, [slf, slt]);
  const updateCriterionProp = ({ prop, value }) => {
    updateCriterion({ ...criterion, [prop]: value });
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
        />
      </p>
      <p
        style={{
          display: true ? "block" : "none",
          padding: "30px",
        }}
      >
        <pre>{JSON.stringify(criteria, null, 2)}</pre>
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
