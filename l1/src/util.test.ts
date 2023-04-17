import { add } from "./util";
import { expect, describe } from "expect";
import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import { Counter } from "./counter";
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("add", () => {
    expect(add()).toBe(0);
    expect(add(1)).toBe(1);
    expect(add(1, 2, 3)).toBe(6);
  });
}
// describe("Counter", () => {
//   test("should display initial count", () => {
//     const { container } = render(<Counter initialCount={5} />);
//     expect(container.textContent).toMatch("Current value: 5");
//   });

//   test('should increment after "Increment" button is clicked', async () => {
//     render(<Counter initialCount={5} />);

//     fireEvent.click(screen.getByText("Increment"));
//     await waitFor(() => {
//       // .toBeInTheDocument() is an assertion that comes from jest-dom.
//       // Otherwise you could use .toBeDefined().
//       expect(screen.getByText("Current value: 6")).toBeInTheDocument();
//     });
//   });
// });
/*

https://github.com/vitest-dev/vitest/blob/main/examples/react-storybook/src/App.test.tsx
https://preactjs.com/guide/v10/preact-testing-library/ 
https://storybook.js.org/docs/preact/get-started/introduction 

*/
