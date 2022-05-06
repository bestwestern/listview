import { useState, useEffect, useRef } from "preact/hooks";
import * as noUiSlider from "nouislider";
import wnumb from "wnumb";
import "nouislider/dist/nouislider.css";
//used to avoid decimals - maybe use
const to = (val) => val.toString();
const from = (val) => Number(val);
export function CriterionNumber({ criterion, updateCriterion, criterionData }) {
  const { min, max, hasDecimalValues } = criterionData;
  const { q, rel = "eq", slf, slt } = criterion; //slf=sliderFrom, slt=sliderTo
  const sliderRef = useRef();
  useEffect(() => {
    var slider = sliderRef.current;
    noUiSlider.create(slider, {
      start: [slf || 0, slt || 0],
      connect: true,
      tooltips: wnumb({ decimals: 0 }),
      range: {
        min: 0,
        max,
      },
      step: 1,
      format: {
        to,
        from,
      },
    });
    slider.noUiSlider.on("end", (val) => {
      let [newFrom, newTo] = val;
      if (!hasDecimalValues) {
        newFrom = Math.round(newFrom);
        newTo = Math.round(newTo);
      }
      updateCriterion({ ...criterion, slf: newFrom, slt: newTo });
    });
  }, []);
  useEffect(() => {
    var slider = sliderRef.current;
    console.log({ min, max });
    // if (slf!==undefined||slt!==undefined){
    //   let newSlf
    //   if (slf!==undefined)
    // }
    slider.noUiSlider.updateOptions(
      { range: { min, max } },
      false // Boolean 'fireSetEvent'
    );
    // const newMin = Math.max([min, slf]);
    // slider.noUiSlider.set([newMin, max]);
  }, [min, max]);
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
        <pre>{JSON.stringify({ criterion, min, max }, null, 2)}</pre>
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
        <div ref={sliderRef} />
      </p>
    </>
  );
}
