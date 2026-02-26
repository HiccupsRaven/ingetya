import { eapp, kel } from "../../lib/kel"
import { Brand } from "./Brand"
import { Main } from "./Main"
import { Nav } from "./Nav"

export class King {
  brand!: Brand
  content: HTMLDivElement = kel("div", "content")
  nav!: Nav
  main!: Main
  get isLocked(): boolean {
    return this.nav.isLocked || this.main.isLocked
  }
  renderEachWrap(): void {
    this.brand = new Brand().run()
    this.nav = new Nav(this).run()
    this.main = new Main(this).run()
  }
  async refresh(): Promise<void> {
    this.main.destroy()
    this.nav.destroy()
    await this.brand.destroy()

    this.run()
  }
  run() {
    this.renderEachWrap()
    this.content.append(this.nav.html, this.main.html)
    eapp().append(this.brand.html, this.content)
  }
}

export const king = new King()
