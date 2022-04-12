import { useState, useRef } from "preact/hooks";
export function CriterionText({ criterion, updateCriterion }) {
  const { q } = criterion;
  const queryChange = (e) => {
    updateCriterion({ ...criterion, q: e.target.value });
  };
  return (
    <p>
      <input type="text" value={q} onInput={queryChange} placeholder="Search" />
    </p>
  );
}
