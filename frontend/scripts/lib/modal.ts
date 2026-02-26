import "../../stylesheets/lib/_modal.scss"
import { IResponse, IAny } from "../types/LibTypes"
import { IModalAlertConfig, IModalConfirmConfig, IModalPromptConfig, IModalSelectConfig } from "../types/ModalTypes"
import { eroot, kel, qutor } from "./kel"
import waittime from "./waittime"

const modal = {
  async loading(newfunc: IAny, msg = "LOADING"): Promise<IAny> {
    const el = kel("div", "loading", {
      e: kel("div", "box", {
        e: [kel("div", "spinner", { e: kel("i", "fa-solid fa-circle-notch fa-spin") }), kel("div", "msg", { e: kel("p", null, { e: msg }) })]
      })
    })
    eroot().append(el)

    await waittime()

    return await newfunc
      .then(async (res: IResponse) => {
        el.classList.add("out")
        await waittime(300, 5)
        el.remove()
        return res
      })
      .catch(async (err: IResponse) => {
        el.classList.add("out")
        await waittime(300, 5)
        el.remove()
        return err
      })
  },
  async smloading(newfunc: IAny, msg = "LOADING"): Promise<IAny> {
    const el = kel("div", "sm-loading")
    el.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>${msg}</span>`
    eroot().append(el)

    await waittime()

    return await newfunc
      .then((res: IResponse) => {
        el.remove()
        return res
      })
      .catch((err: IResponse) => {
        el.remove()
        return err
      })
  },
  element() {
    document.body.style.overflowY = "hidden"
    return kel("div", "modal")
  },
  alert(options: Partial<IModalAlertConfig> | string): Promise<boolean> {
    return new Promise((resolve) => {
      const definedMsg = typeof options === "string" ? options : null

      const s: IModalAlertConfig = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: definedMsg ? definedMsg : "",
          okx: "OKE"
        },
        typeof options === "string" ? {} : options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p>${typeof s === "string" ? s || "" : s.msg || ""}</p>
        </div>
        <div class="acts act">
          <button class="btn btn-cancel btn-ok">OKE</button>
        </div>
      </div>`

      const btn = qutor(".acts .btn-ok", el)
      if (btn) btn.innerText = s.okx

      eroot().append(el)

      if (btn) {
        btn.onclick = async () => {
          el.classList.add("out")
          await waittime()
          el.remove()
          document.body.style.overflowY = "auto"
          resolve(false)
          if (s.ok) s.ok()
          return
        }
      }
    })
  },
  confirm(options: Partial<IModalConfirmConfig> | string): Promise<boolean> {
    return new Promise((resolve) => {
      const definedMsg = typeof options === "string" ? options : null

      const s: IModalConfirmConfig = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: definedMsg ? definedMsg : "",
          okx: "OKE",
          cancelx: "BATAL"
        },
        typeof options === "string" ? {} : options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p>${typeof s === "string" ? s || "" : s.msg || ""}</p>
        </div>
        <div class="acts">
          <button class="btn btn-cancel">BATAL</button>
          <button class="btn btn-ok">OKE</button>
        </div>
      </div>`

      const btnOk = qutor(".acts .btn-ok", el)
      if (btnOk) btnOk.innerText = s.okx
      const btnCancel = qutor(".acts .btn-cancel", el)
      if (btnCancel) btnCancel.innerText = s.cancelx

      eroot().append(el)

      if (btnOk) {
        btnOk.onclick = async () => {
          el.classList.add("out")
          await waittime()
          el.remove()
          document.body.style.overflowY = "auto"
          resolve(true)
          if (s.ok) s.ok()
        }
      }
      if (btnCancel) {
        btnCancel.onclick = async () => {
          el.classList.add("out")
          await waittime()
          el.remove()
          document.body.style.overflowY = "auto"
          resolve(false)
          if (s.cancel) s.cancel()
        }
      }
    })
  },
  prompt(options: Partial<IModalPromptConfig> | string): Promise<string | null> {
    return new Promise((resolve) => {
      const definedMsg = typeof options === "string" ? options : null

      const s: IModalPromptConfig = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: definedMsg ? definedMsg : "",
          okx: "OKE",
          cancelx: "BATAL",
          tarea: false
        },
        options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p><label for="prompt-field">${typeof s === "string" ? s || "" : s.msg || ""}</label></p>
        </div>
        <div class="acts">
          <button class="btn btn-cancel">BATAL</button>
          <button class="btn btn-ok">OKE</button>
        </div>
      </div>`

      const btnOk = qutor(".acts .btn-ok", el)
      if (btnOk) btnOk.innerText = s.okx
      const btnCancel = qutor(".acts .btn-cancel", el)
      if (btnCancel) btnCancel.innerText = s.cancelx

      const einf = qutor(".inf", el)
      let inp = null
      if (s.tarea) {
        inp = kel("textarea")
        inp.maxLength = s.max ? s.max : 300
      } else {
        inp = kel("input")
        inp.type = "text"
        inp.maxLength = s.max ? s.max : 100
        inp.autocomplete = "off"
        inp.onkeydown = (e) => {
          if (e.key.toLowerCase() === "enter") {
            btnOk?.click()
          }
        }
      }

      inp.name = "prompt-field"
      inp.id = "prompt-field"
      inp.placeholder = s.pholder || "Type Here"

      if (s.iregex) {
        const tpRegex = s.iregex
        inp.oninput = () => (inp.value = inp.value.replace(tpRegex, ""))
      }

      einf?.append(inp)
      eroot().append(el)
      inp.focus()
      if (s.val) inp.value = s.val

      if (btnOk) {
        btnOk.onclick = async () => {
          el.classList.add("out")
          await waittime()
          el.remove()
          document.body.style.overflowY = "auto"
          resolve(inp.value)
          if (s.ok) s.ok()
        }
      }
      if (btnCancel) {
        btnCancel.onclick = async () => {
          el.classList.add("out")
          await waittime()
          el.remove()
          document.body.style.overflowY = "auto"
          resolve(null)
          if (s.cancel) s.cancel()
        }
      }
    })
  },
  select(options: Partial<IModalSelectConfig>): Promise<string | null> {
    return new Promise((resolve) => {
      const s = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: "",
          okx: "OKE",
          cancelx: "BATAL",
          items: [
            { id: "not_a", label: "Please Add Option 1", activated: false },
            { id: "not_a", label: "Please Add Option 2", activated: false }
          ]
        },
        options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p>${typeof s === "string" ? s || "" : s.msg || ""}</p>
          <form class="modal-radio-form" id="modal-radio-form"></form>
        </div>
        <div class="acts">
          <button class="btn btn-cancel">BATAL</button>
          <button class="btn btn-ok">OKE</button>
        </div>
      </div>`

      const form = qutor(".box .inf #modal-radio-form", el) as HTMLFormElement
      const optionId = Date.now().toString(36)
      const radioInputs: HTMLDivElement[] = []
      s.items.forEach((itm) => {
        const radioInp = kel("input", null, {
          a: {
            type: "radio",
            name: optionId,
            id: `${optionId}-${itm.id}`,
            value: itm.id,
            required: "true",
            checked: itm.activated ? "true" : false
          }
        })
        const radioLabel = kel("label", null, {
          a: { for: `${optionId}-${itm.id}` },
          e: [radioInp, `<p>${itm.label}</p>`]
        })

        const radio = kel("div", "radio", { e: radioLabel })
        radioInputs.push(radio)
        form.append(radio)
      })

      const btnOk = qutor(".acts .btn-ok", el)
      if (s.okx && btnOk) btnOk.innerText = s.okx
      const btnCancel = qutor(".acts .btn-cancel", el)
      if (s.cancelx && btnCancel) btnCancel.innerText = s.cancelx

      eroot().append(el)

      if (btnOk) {
        btnOk.onclick = async () => {
          let data = null
          const formData = new FormData(form)
          formData.forEach((val) => (data = val.toString()))
          el.classList.add("out")
          await waittime()
          el.remove()
          document.body.style.overflowY = "auto"
          resolve(data)
          if (s.ok) s.ok()
        }
      }
      if (btnCancel) {
        btnCancel.onclick = async () => {
          el.classList.add("out")
          await waittime()
          el.remove()
          document.body.style.overflowY = "auto"
          resolve(null)
          if (s.cancel) s.cancel()
        }
      }
    })
  },
  async abort(): Promise<void> {
    const btnCancel = qutor(".modal .acts .btn-cancel")
    if (btnCancel) {
      btnCancel.click()
      await waittime()
    }
    await waittime(100)
    document.body.style.overflowY = "auto"
  }
}
export default modal
