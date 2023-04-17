const template = document.createElement("template");
template.innerHTML = `
  <style>
    button, p {
      display: inline-block;
    }
  </style>
  <h3>My custom criterion - ID should be divisible by X</h3>
  <button aria-label="decrement">-</button>
    <p>0</p>
  <button aria-label="increment">+</button>
`;
class XCounter extends HTMLElement {
  set value(value) {
    this._value = value;
    this.valueElement.innerText = this._value;
  }

  get value() {
    return this._value;
  }

  set criterion(criterion) {
    this.value = criterion.c || 0;
  }
  changeVal(newValue) {
    this.dispatchEvent(
      new CustomEvent("updateCriterion", { detail: { c: newValue } })
    );
  }

  constructor() {
    super();
    this._value = 0;
    var self = this;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.valueElement = this.shadowRoot.querySelector("p");
    this.incrementButton = this.shadowRoot.querySelectorAll("button")[1];
    this.decrementButton = this.shadowRoot.querySelectorAll("button")[0];
    this.incrementButton.addEventListener("click", () =>
      this.changeVal(this._value + 1)
    );
    this.decrementButton.addEventListener("click", (e) =>
      this.changeVal(this._value - 1)
    );
  }
}

customElements.define("x-counter", XCounter);
