const template = document.createElement("template");
template.innerHTML = `
  <style>
    button, p {
      display: inline-block;
    }
  </style>
  <button aria-label="decrement">-</button>
    <p>0</p>
  <button aria-label="increment">+</button>
`;
class XCounter extends HTMLElement {
  set value(value) {
    this._value = value;
    this.valueElement.innerText = this._value;
    this.dispatchEvent(
      new CustomEvent("updateCriterion", { detail: { c: this._value } })
    );
  }

  get value() {
    return this._value;
  }
  constructor() {
    super();
    console.log(this);
    this._value = 0;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.valueElement = this.shadowRoot.querySelector("p");
    this.incrementButton = this.shadowRoot.querySelectorAll("button")[1];
    this.decrementButton = this.shadowRoot.querySelectorAll("button")[0];
    this.incrementButton.addEventListener("click", (e) => this.value++);
    this.decrementButton.addEventListener("click", (e) => this.value--);
  }
}

customElements.define("x-counter", XCounter);
