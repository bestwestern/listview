import { useEffect, useRef, useMemo } from "preact/hooks";
import * as noUiSlider from "nouislider";
import wnumb from "wnumb";
import "nouislider/dist/nouislider.css";
//used to avoid decimals - maybe use

const Slider = (props) => {
  const { hasDecimalValues, min, max } = props;
  const sliderRef = useRef();
  useEffect(() => {
    var slider = sliderRef.current;
    noUiSlider.create(slider, {
      start: [3, 88],
      connect: true,
      tooltips: wnumb({ decimals: 0 }),
      range: {
        min,
        max,
      },
      step: 1,
    });
    slider.noUiSlider.on("end", (val) => {
      let [newFrom, newTo] = val;
      if (!hasDecimalValues) {
        newFrom = Math.round(newFrom);
        newTo = Math.round(newTo);
      }
      console.log({ newFrom, newTo });
    });
  }, []);
  useEffect(() => {
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

  return <div ref={sliderRef} />;
};

export default useMemo(Slider);
