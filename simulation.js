const reagents = {
    A: null,
    B: null,
    C: null,
    D: null,
    E: null
};

let beakers = {
    1: { drops: {}, phenolphthalein: false, totalAcid: 0, totalBase: 0, history: [], lastAction: null },
    2: { drops: {}, phenolphthalein: false, totalAcid: 0, totalBase: 0, history: [], lastAction: null },
    3: { drops: {}, phenolphthalein: false, totalAcid: 0, totalBase: 0, history: [], lastAction: null }
};

let beakerCount = 3;
const substances = [
    { name: "1価の強酸（塩酸）", type: "acid", valence: 1 },
    { name: "2価の強酸（硫酸）", type: "acid", valence: 2 },
    { name: "水", type: "neutral", valence: 0 },
    { name: "1価の強塩基（水酸化ナトリウム）", type: "base", valence: 1 },
    { name: "2価の強塩基（水酸化カルシウム）", type: "base", valence: 2 }
];

function initializeReagents() {
    const shuffledSubstances = substances.sort(() => Math.random() - 0.5);
    reagents.A = shuffledSubstances[0];
    reagents.B = shuffledSubstances[1];
    reagents.C = shuffledSubstances[2];
    reagents.D = shuffledSubstances[3];
    reagents.E = shuffledSubstances[4];
    console.log("試薬の割り当て:", reagents);
}

function getSelectedBeaker() {
    return document.getElementById('selectedBeaker').value;
}

function addDrop(reagentLetter) {
    const beakerNumber = getSelectedBeaker();
    const reagent = reagents[reagentLetter];
    const beaker = beakers[beakerNumber];
    
    if (!beaker.drops[reagentLetter]) {
        beaker.drops[reagentLetter] = 0;
    }

    beaker.drops[reagentLetter]++;
    beaker.history.push(`ビーカー ${beakerNumber} に試薬${reagentLetter}が1滴加えられました。`); // ここで名前を表示しない
    beaker.lastAction = `addDrop-${reagentLetter}`;
    
    if (reagent.type === "acid") {
        beaker.totalAcid += reagent.valence;
    } else if (reagent.type === "base") {
        beaker.totalBase += reagent.valence;
    }

    updateLiquidLevel(beakerNumber);
}

function addPhenolphthalein() {
    const beakerNumber = getSelectedBeaker();
    const beaker = beakers[beakerNumber];
    beaker.phenolphthalein = true;
    beaker.history.push(`ビーカー ${beakerNumber} にフェノールフタレインが加えられました。`);
    beaker.lastAction = "addPhenolphthalein";
    updateLiquidLevel(beakerNumber);
}

function updateLiquidLevel(beakerNumber) {
    const beaker = beakers[beakerNumber];
    const liquidElement = document.getElementById(`liquid${beakerNumber}`);
    const totalDrops = Object.values(beaker.drops).reduce((acc, val) => acc + val, 0);
    
    // 液面の高さを設定
    liquidElement.style.height = `${Math.min(totalDrops * 10, 100)}%`;

    // 色の設定
    let isRed = false;
    if (beaker.phenolphthalein) {
        const totalAcid = beaker.totalAcid;
        const totalBase = beaker.totalBase;
        const height = totalDrops * 10;

        if (totalBase > totalAcid) {
            isRed = true; // 塩基性の場合、マゼンタになるフラグを設定
        }
    }

    // 液体の色を更新
    liquidElement.style.backgroundColor = isRed ? "magenta" : "lightblue"; // マゼンタ色に変更
}

function resetBeaker() {
    const beakerNumber = getSelectedBeaker();
    const beaker = beakers[beakerNumber];
    beaker.drops = {};
    beaker.phenolphthalein = false;
    beaker.totalAcid = 0;
    beaker.totalBase = 0;
    beaker.history.push(`ビーカー ${beakerNumber} がリセットされました。`);
    beaker.lastAction = null; // 最後のアクションをリセット
    updateLiquidLevel(beakerNumber);
}

function undoLastAction() {
    const beakerNumber = getSelectedBeaker();
    const beaker = beakers[beakerNumber];
    const lastAction = beaker.lastAction;
    
    if (lastAction) {
        const [action, reagentLetter] = lastAction.split('-');
        
        if (action === "addDrop") {
            beaker.drops[reagentLetter]--;
            const reagent = reagents[reagentLetter];
            if (reagent.type === "acid") {
                beaker.totalAcid -= reagent.valence;
            } else if (reagent.type === "base") {
                beaker.totalBase -= reagent.valence;
            }
        } else if (action === "addPhenolphthalein") {
            beaker.phenolphthalein = false;
        }

        beaker.history.pop();
        beaker.lastAction = null;
        updateLiquidLevel(beakerNumber);
    }
}

function revealReagents() {
    const answersDiv = document.getElementById("reagentAnswers");
    answersDiv.innerHTML = `
        <p>試薬A: ${reagents.A.name}</p>
        <p>試薬B: ${reagents.B.name}</p>
        <p>試薬C: ${reagents.C.name}</p>
        <p>試薬D: ${reagents.D.name}</p>
        <p>試薬E: ${reagents.E.name}</p>
    `;

    // 履歴に試薬名を表示
    for (let beakerNumber in beakers) {
        beakers[beakerNumber].history = beakers[beakerNumber].history.map(historyItem => {
            return historyItem.replace(/試薬([A-E])/, (match, p1) => {
                return `試薬${p1}（${reagents[p1].name}）`;
            });
        });
    }
}

function showHistory() {
    const beakerNumber = getSelectedBeaker();
    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = beakers[beakerNumber].history.join('<br>');
}

function addBeaker() {
    beakerCount++;
    const container = document.getElementById("container");
    
    const newBeakerDiv = document.createElement("div");
    newBeakerDiv.classList.add("beaker");
    newBeakerDiv.id = `beaker${beakerCount}`;
    newBeakerDiv.innerHTML = `ビーカー ${beakerCount} <div class="liquid-level" id="liquid${beakerCount}" style="height: 0;"></div>`;
    
    container.appendChild(newBeakerDiv);
    beakers[beakerCount] = { drops: {}, phenolphthalein: false, totalAcid: 0, totalBase: 0, history: [], lastAction: null };

    const beakerSelect = document.getElementById("selectedBeaker");
    const newOption = document.createElement("option");
    newOption.value = beakerCount;
    newOption.text = `ビーカー ${beakerCount}`;
    beakerSelect.appendChild(newOption);
}

// 初期化処理
initializeReagents();
