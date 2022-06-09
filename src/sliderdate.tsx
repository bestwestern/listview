import { Component, createRef } from "preact";
import * as noUiSlider from "nouislider";
import wnumb from "wnumb";
import { dateToString } from "./util";
import "nouislider/dist/nouislider.css";
function timestamp(str) {
  return new Date(str).getTime();
}
class SliderDate extends Component {
  constructor(props) {
    super(props);
    console.log({ props });
    this.sliderRef = createRef();
    this.criteria = props.criteria;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { criteria, criterion, criterionData } = nextProps;
    const { slf, slt } = criterion;
    const { minDate, maxDate } = criterionData;
    var slider = this.sliderRef.current;
    if (slf === undefined) console.log({ minDate });
    if (minDate !== false) {
      slider.noUiSlider.updateOptions(
        { range: { min: minDate, max: maxDate } },
        false // Boolean 'fireSetEvent'
      );
      slider.noUiSlider.set([
        Math.max(minDate, slf === undefined ? minDate : slf),
        Math.min(maxDate, slt === undefined ? maxDate : slt),
      ]);
    }

    // const newMin = Math.max([min, slf]);

    this.criteria = criteria;
    return false;
  }
  componentDidMount() {
    const slider = this.sliderRef.current;
    const {
      criterion,
      criterionData,
      setCriteria,
      criteriaIndex,
      defaultdateformat,
    } = this.props;
    const { minDate, maxDate } = criterionData;
    const { slf, slt } = criterion;
    const start = [slf || minDate, slt || maxDate];
    noUiSlider.create(slider, {
      range: {
        min: minDate,
        max: maxDate,
      },
      tooltips: {
        from: Number,
        to: function (value) {
          return dateToString(new Date(value), defaultdateformat);
        },
      },
      pips: {
        mode: "positions",
        values: [0, 25, 50, 75, 100],
        density: 4,
        stepped: true,
      },
      // Steps of one day
      step: 24 * 60 * 60 * 1000,
      start,
      format: wnumb({
        decimals: 0,
      }),
    });
    slider.noUiSlider.on("end", (val) => {
      let [newFrom, newTo] = val;
      console.log("updating");
      let criteria = this.criteria;
      let cr = criteria;
      let value = criteria[criteriaIndex];
      value.slf = newFrom;
      value.slt = newTo;
      value.q = "";
      cr = cr.map((c, i) => (i === criteriaIndex ? value : c));
      console.log(JSON.stringify(cr));
      setCriteria(cr);
    });
  }
  render() {
    return <div ref={this.sliderRef}></div>;
  }
}

export { SliderDate };
