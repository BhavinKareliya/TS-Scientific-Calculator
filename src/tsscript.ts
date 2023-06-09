const __DISPLAY = document.getElementById("screen") as HTMLInputElement;
const __EQ_DISPLAY = document.getElementById(
  "equation-screen"
) as HTMLInputElement;

let generalBtns = document.querySelectorAll(".gen-btn");
let unitCtrlBtns = document.querySelectorAll(".unit-ctrl");
let extraFuncsBtns = document.querySelectorAll(".extra-functions");
let frontBtns = document.querySelectorAll(".front");
let backBtns = document.querySelectorAll(".back");
let memoryBtns = document.querySelectorAll(".memory-btn");
let memoryStack = document.getElementById("memory-stack") as HTMLDivElement;
let switchSidesBtn = document.querySelector(
  ".switch-sides"
) as HTMLButtonElement;

let isPrevNum: boolean = false,
  allowOnlyNumber: boolean = true,
  isFront: boolean = true,
  isFloat: boolean = false,
  isExp: boolean = false;
let braceCnt: number = 0,
  htmlContent: string = "";
let expStack: any = [],
  memory: any = [];
let currUnit: string = "RAD";

const MemorySheet: any = {
  appendMemory: (val: number): void => {
    htmlContent = `<div class="alert alert-dark" role="alert">
                        <h6> ${val}</h6>
                    </div>`;
    memoryStack.insertAdjacentHTML("afterbegin", htmlContent);
  },
  replace: (val: number): void => {
    memoryStack.removeChild(memoryStack.firstChild as HTMLElement);
    MemorySheet!.appendMemory(val);
  },
  remove: (): void => {
    memoryStack.firstChild!.remove();
  },
  memoryRead: (): void => {
    if (isPrevNum) expStack.pop();
    expStack.push(memory.slice(-1));
    isPrevNum = true;
    allowOnlyNumber = false;
    reloadDisplay();
  },
  handleBtns: (): void => {
    if (memory.length > 0) {
      document.getElementById("M+")!.removeAttribute("disabled");
      document.getElementById("MR")!.removeAttribute("disabled");
      document.getElementById("M-")!.removeAttribute("disabled");
      document.getElementById("MC")!.removeAttribute("disabled");
      document.getElementById("btm-sheet")!.removeAttribute("disabled");
    } else {
      document.getElementById("M+")!.setAttribute("disabled", true);
      document.getElementById("MR")!.setAttribute("disabled", true);
      document.getElementById("M-")!.setAttribute("disabled", true);
      document.getElementById("MC")!.setAttribute("disabled", true);
      document.getElementById("btm-sheet")!.setAttribute("disabled", true);
    }
  },
};

if (sessionStorage.getItem("Store")) {
  memory = sessionStorage.getItem("Store");
  if (memory.length > 0) {
    memory = memory.split(",");
    memory.map((x: any) => {
      MemorySheet.appendMemory(x);
    });
  }
  MemorySheet.handleBtns();
}

const push = (val: any): void => {
  let prev: string | number = expStack.slice(-1)[0];
  if (!isNaN(val)) {
    //append digits to previous number
    if (prev == ")") expStack.push("*");
    if (isPrevNum) val = expStack.pop() * 10 + parseInt(val);

    isPrevNum = true;
    allowOnlyNumber = false;
    val = parseInt(val);
  } else {
    //prevent from entering operator at first
    if (expStack.length == 0 && val != "(") return;
    if (prev == "(" && val == ")") return;
    if (val == ")" && prev != ")" && isNaN(prev)) return;

    if (val == ".") {
      if (isFloat) return;
      isFloat = true;
      if (!isPrevNum) push(0);
      push(".");
      isPrevNum = false;
      allowOnlyNumber = true;
    } else {
      isFloat = false;
    }

    //change operators if TOP is already an operator
    if (!isPrevNum && val != "(" && prev != ")" && val != ".") expStack.pop();

    if (val == "(") {
      braceCnt++;
      if (prev == ")") expStack.push("*");
      if (isPrevNum) expStack.push("*");
    }

    if (val == ")") {
      if (braceCnt == 0) return;

      if (!isPrevNum && prev != ")") return;

      if (isPrevNum || prev == ")") braceCnt--;
    }

    isPrevNum = false;
  }
  expStack.push(val);
};

const pop = (): void => {
  let prev: string | number = expStack.slice(-1);

  if (expStack.length == 0) return;

  if (isPrevNum) {
    if (prev <= 10) {
      expStack.pop();
      isPrevNum = isNaN(expStack.slice(-1)) ? false : true;
    } else {
      let top = expStack.pop();
      top / 10 != 0 ? expStack.push(Math.floor(top / 10)) : expStack.pop();
    }
  } else {
    expStack.pop();
    if (prev == ")") {
      braceCnt++;
      expStack.push;
    }
    isPrevNum = isNaN(expStack.slice(-1)) ? false : true;
  }
  if (expStack.length == 0) expStack.push(0);
};

const reloadDisplay = (): void => {
  __DISPLAY.value = expStack.join("");
};

const calculate = (): void => {
  let TOP: any = expStack.at(-1);
  while (isNaN(TOP) && TOP != ")") {
    expStack.pop();
    TOP = expStack.at(-1);
  }
  const exp: string = expStack.join("");
  let res: any = eval(exp);

  __DISPLAY.value = res.toString();
  __EQ_DISPLAY.value = exp + "=";

  res = isExp ? res.toExponential() : res.toFixed();

  expStack = [res];
  isPrevNum = true;
};

const resetAll = (error = null): void => {
  if (error != null) __DISPLAY.value = "Invalid Expression!";
  else __DISPLAY.value = "0";
  __EQ_DISPLAY.value = "";
  expStack = [0];
  allowOnlyNumber = false;
  isPrevNum = true;
};

const fact = (num: number): number => {
  let res = 1;
  while (num > 1) {
    res *= num--;
  }
  return res;
};

const YbaseX = (): void => {
  allowOnlyNumber = true;
  expStack.push("**");
  isPrevNum = false;
};

const storeExp = (num: number): void => {
  var split = num.toExponential().split("+");
  expStack.push(split[0] + "+");
  expStack.push(parseInt(split[1]));
};

unitCtrlBtns.forEach((btn): void => {
  btn.addEventListener("click", (e) => {
    let target = e.target as HTMLButtonElement;
    target.classList.toggle("active");
    if (target.value == "DEG") {
      currUnit = currUnit == "RAD" ? "DEG" : "RAD";
    } else {
      isExp = !isExp;
      if (isExp) {
        var pop = expStack.pop();
        storeExp(pop);
        reloadDisplay();
      }
    }
  });
});

memoryBtns.forEach((btn): void => {
  btn.addEventListener("click", (e): void => {
    let operation = (e.target as HTMLButtonElement).value;
    if (isPrevNum || operation == "MR" || operation == "MC") {
      let latestVal: any = expStack.slice(-1);

      switch (operation) {
        case "MS":
          memory.push(latestVal);
          sessionStorage.setItem("Store", memory);
          MemorySheet.appendMemory(latestVal);
          MemorySheet.handleBtns();
          break;
        case "M+":
          var res = parseInt(memory.pop()) + parseInt(latestVal);
          memory.push(res);
          sessionStorage.setItem("Store", memory);
          MemorySheet.replace(res);
          break;
        case "M-":
          var res = parseInt(memory.pop()) - parseInt(latestVal);
          memory.push(res);
          sessionStorage.setItem("Store", memory);
          MemorySheet.replace(res);
          break;
        case "MC":
          sessionStorage.removeItem("Store");
          memory = [];
          memoryStack.innerHTML = "";
          MemorySheet.handleBtns();
          break;
        case "MR":
          MemorySheet.memoryRead();
          break;
      }
    }
  });
});

extraFuncsBtns.forEach((btn): void => {
  btn.addEventListener("click", (e): void => {
    let val: string = (e.target as HTMLButtonElement).value,
      res: number = 0;
    let latestval: any = expStack.pop();
    switch (val) {
      case "SIN":
        if (isPrevNum)
          res =
            currUnit == "RAD"
              ? Math.sin(latestval)
              : Math.sin(latestval * (Math.PI / 180));
        break;
      case "COS":
        if (isPrevNum)
          res =
            currUnit == "RAD"
              ? Math.cos(latestval)
              : Math.cos(latestval * (Math.PI / 180));
        break;
      case "TAN":
        if (isPrevNum)
          res =
            currUnit == "RAD"
              ? Math.tan(latestval)
              : Math.tan(latestval * (Math.PI / 180));
        break;
      case "ABS":
        if (isPrevNum) expStack.push(Math.abs(expStack.pop()));
        break;
      case "RAND":
        expStack = [];
        res = Math.random();
    }
    expStack.push(res);
    isPrevNum = true;
    reloadDisplay();
  });
});

generalBtns.forEach((btn): void => {
  btn.addEventListener("click", (e): void => {
    let val: any = (e.target as HTMLButtonElement).value;

    if (
      allowOnlyNumber &&
      isNaN(val) &&
      val != "CLS" &&
      val != "PI" &&
      val != "EXP"
    )
      return;

    try {
      switch (val) {
        case "SKIP":
          break;
        case "CLS":
          resetAll();
          return;
        case "PI":
          resetAll();
          expStack.push(Math.PI);
          isPrevNum = true;
          break;
        case "DEL":
          pop();
          break;
        case "ABS":
          if (isPrevNum) expStack.push(Math.abs(expStack.pop()));
          break;
        case "INVERSE":
          if (isPrevNum) expStack.push(1 / expStack.pop());
          break;
        case "EXP":
        case "EULER":
          resetAll();
          expStack.push(Math.E);
          isPrevNum = true;
          break;
        case "SQ":
          push("**");
          push(2);
          isPrevNum = true;
          break;
        case "CUBE":
          if (isPrevNum) expStack.push(Math.pow(expStack.pop(), 3));
          break;
        case "CBRT":
          if (isPrevNum) expStack.push(Math.cbrt(expStack.pop()));
          break;
        case "FACT":
          if (isPrevNum) expStack.push(fact(expStack.pop()));
          break;
        case "Y-SQRT-X":
        case "SQRT":
          if (isPrevNum) expStack.push(Math.sqrt(expStack.pop()));
          break;
        case "Y-BASE-X":
          if (isPrevNum) YbaseX();
          break;
        case "Y-BASE-E":
          if (isPrevNum) expStack.push(Math.exp(expStack.pop()));
          break;
        case "BASE10":
          if (isPrevNum) expStack.push(10 ** expStack.pop());
          break;
        case "BASE2":
          if (isPrevNum) expStack.push(Math.pow(2, expStack.pop()));
          break;
        case "LOG":
          if (isPrevNum) expStack.push(Math.log10(expStack.pop()));
          break;
        case "LN":
          if (isPrevNum) expStack.push(Math.log10(expStack.pop()));
          break;
        case "NEGATE":
          if (isPrevNum) expStack.push(-expStack.pop());
          break;
        case "=":
          if (braceCnt > 0) return;
          calculate();
          break;
        default:
          push(val);
          break;
      }
    } catch (e: any) {
      resetAll(e.message);
    }
    reloadDisplay();
  });
});

switchSidesBtn.addEventListener("click", (e) => {
  isFront = isFront ? false : true;
  if (isFront) {
    frontBtns.forEach((ele): void => {
      ele.classList.add("flex-grow-1");
      ele.classList.remove("d-none");
    });
    backBtns.forEach((ele): void => {
      ele.classList.add("d-none");
      ele.classList.remove("flex-grow-1");
    });
  } else {
    frontBtns.forEach((ele): void => {
      ele.classList.add("d-none");
    });
    backBtns.forEach((ele): void => {
      ele.classList.add("flex-grow-1");
      ele.classList.remove("d-none");
    });
  }
  (e.target as HTMLButtonElement).classList.toggle("active");
});
