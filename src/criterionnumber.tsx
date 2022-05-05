import { useState, useEffect, useRef } from "preact/hooks";
import * as noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";
export function CriterionNumber({ criterion, updateCriterion, criterionData }) {
  console.log({ criterionData });
  const sliderRef = useRef();
  const min = criterionData && criterionData.min ? criterionData.min : 0;
  const max = criterionData && criterionData.max ? criterionData.max : 0;
  const [showCount, setShowCount] = useState(8);
  useEffect(() => {
    setShowCount(8);
  }, [criterionData]);
  useEffect(() => {
    var slider = sliderRef.current;
    noUiSlider.create(slider, {
      start: [min, max],
      connect: true,
      tooltips: {
        to: function (value) {
          return value.toString();
        },
        from: function (value) {
          return value;
        },
      },
      range: {
        min: 0,
        max,
      },
      step: 1,
      format: {
        to: function (value) {
          return value.toString();
        },
        from: function (value) {
          return value;
        },
      },
    });
  }, []);
  useEffect(() => {
    var slider = sliderRef.current;
    console.log(slider);
    slider.noUiSlider.updateOptions(
      { range: { min, max } },
      false // Boolean 'fireSetEvent'
    );
    slider.noUiSlider.set([min, max]);
    // var slider = document.getElementById("slider");
    // noUiSlider.create(slider, {
    //   start: [20, 80],
    //   connect: true,
    //   tooltips: true,
    //   range: {
    //     min,
    //     max: 100,
    //   },
    // });
  }, [min, max]);
  const { q, rel = "eq" } = criterion;
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
          placeholder="Search"
        />
      </p>
      <p
        style={{
          display: max && min !== max ? "block" : "none",
          padding: "30px",
        }}
      >
        <div ref={sliderRef} />
      </p>
    </>
  );
}
