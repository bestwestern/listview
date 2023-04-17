import { useEffect, useState, useRef } from "preact/hooks";

export function ProgressBar({ searchedPercentage }) {
  return (
    <div>
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          style={"width: " + searchedPercentage + "%;"}
          aria-valuenow="25"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {searchedPercentage + "%"}
        </div>
      </div>
    </div>
  );
}

{
  /* <div
  class="progress-bar bg-success"
  role="progressbar"
  style="width: 30%"
  aria-valuenow="30"
  aria-valuemin="0"
  aria-valuemax="100"
></div> */
}
