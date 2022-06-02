import { Component, createRef } from "preact";
import * as noUiSlider from "nouislider";
import wnumb from "wnumb";
import "nouislider/dist/nouislider.css";
//used to avoid decimals - maybe use
//used to avoid decimals - maybe use
const to = (val) => val.toString();
const from = (val) => Number(val);
const makeSlider = (min, max, hasDecimalValues) => {
  if (hasDecimalValues === undefined) return null;
  return <Slider hasDecimalValues={hasDecimalValues} min={min} max={max} />;
};
class Slider extends Component {
  constructor(props) {
    super(props);
    this.sliderRef = createRef();
    this.criteria = props.criteria;
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log({ nextProps });
    console.log({ cur: this.props });
    const { criteria, criterion, criterionData } = nextProps;
    const { slf, slt } = criterion;
    const { min, max } = criterionData;
    var slider = this.sliderRef.current;
    console.log({ slf, slt, min, max });
    if (slf === undefined) console.log({ min });
    if (min !== false)
      slider.noUiSlider.updateOptions(
        { range: { min, max } },
        false // Boolean 'fireSetEvent'
      );

    // const newMin = Math.max([min, slf]);

    this.criteria = criteria;
    return false;
  }
  componentDidMount() {
    const slider = this.sliderRef.current;
    const { criterion, criterionData, setCriteria, criteriaIndex } = this.props;
    const { min, max, hasDecimalValues } = criterionData;
    const { slf, slt } = criterion;
    const start = [slf || min || 1, slt || max || 1];
    console.log(start);
    noUiSlider.create(slider, {
      start,
      connect: true,
      tooltips: wnumb({ decimals: 0 }),
      range: {
        min,
        max,
      },
      pips: {
        mode: "range",
        density: 3,
      },
      step: 1,
    });
    slider.noUiSlider.on("end", (val) => {
      let [newFrom, newTo] = val;
      if (!hasDecimalValues) {
        newFrom = Math.round(newFrom);
        newTo = Math.round(newTo);
      }
      console.log("updating");
      let criteria = this.criteria;
      let cr = criteria;
      let value = criteria[criteriaIndex];
      value.slf = newFrom;
      value.slt = newTo;
      value.q = "";
      delete value.rel;
      console.log(JSON.stringify(cr));
      cr = cr.map((c, i) => (i === criteriaIndex ? value : c));
      console.log(JSON.stringify(cr));
      setCriteria(cr);
    });
  }
  render() {
    return <div ref={this.sliderRef}></div>;
  }
}

export { Slider };

const Sliderex = (props) => {
  console.log("sliderupdate");
  const { hasDecimalValues, min, max } = props;
  console.log({ hasDecimalValues, min, max });
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
    sliderRef.current.noUiSlider.updateOptions(
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

//export default Slider;
