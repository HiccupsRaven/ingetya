import { kel } from "../../lib/kel"
import waittime from "../../lib/waittime"

export class Brand {
  private readonly name: string = "IngetYa"
  private page: string = "Dashboard"
  private el!: HTMLDivElement
  private createElement(): void {
    this.el = kel("div", "brand")
    this.el.innerHTML = `${this.name}: ${this.page}`
  }
  get pageName(): string {
    return this.page
  }
  set pageName(text: string) {
    this.page = text
    this.setPageName(text)
  }
  private setPageName(text?: string): void {
    this.el.innerHTML = `${this.name}: ${text ?? this.page}`
  }
  get html(): HTMLDivElement {
    return this.el
  }
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await waittime()
    this.el.remove()
  }
  run(): this {
    this.createElement()
    return this
  }
}
