const missions = [
  { id: "study", icon: "✏️", text: "勉強のテキストを開く" },
  { id: "squat", icon: "💪", text: "スクワット10回" },
  { id: "clean", icon: "🧹", text: "部屋掃除3分" }
];

const POINT_PER_MISSION = 100;
const STORAGE_KEY = "haruna-action-bank-records";

const savingRanks = [
  { name: "はじめの積立", pt: 0 },
  { name: "小さな積立", pt: 500 },
  { name: "着実な積立", pt: 1000 },
  { name: "積立習慣家", pt: 2000 },
  { name: "堅実な積立家", pt: 4000 },
  { name: "行動資産家", pt: 7000 },
  { name: "継続の達人", pt: 10000 },
  { name: "榛名の誇り", pt: 15000 }
];

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKeyByOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() - offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekdayLabel(dateKey) {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date(dateKey);
  return weekdays[date.getDay()];
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("記録データの読み込みに失敗しました:", error);
    return {};
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function calculateTotal(records) {
  return Object.values(records).reduce((total, dayRecord) => {
    const count = missions.filter(mission => dayRecord[mission.id]).length;
    return total + count * POINT_PER_MISSION;
  }, 0);
}

function getSavingRankStatus(totalPoint) {
  for (let i = savingRanks.length - 1; i >= 0; i--) {
    if (totalPoint >= savingRanks[i].pt) {
      const currentRank = savingRanks[i];
      const nextRank = savingRanks[i + 1];

      if (!nextRank) {
        return {
          currentRank,
          nextRank: null,
          remaining: 0,
          progress: 100,
          level: i + 1
        };
      }

      const range = nextRank.pt - currentRank.pt;
      const gained = totalPoint - currentRank.pt;
      const progress = Math.min(100, Math.round((gained / range) * 100));
      const remaining = nextRank.pt - totalPoint;

      return {
        currentRank,
        nextRank,
        remaining,
        progress,
        level: i + 1
      };
    }
  }

  return {
    currentRank: savingRanks[0],
    nextRank: savingRanks[1],
    remaining: savingRanks[1].pt,
    progress: 0,
    level: 1
  };
}

function renderHistory(records) {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  historyList.innerHTML = "";

  for (let i = 6; i >= 0; i--) {
    const dateKey = getDateKeyByOffset(i);
    const dayRecord = records[dateKey] || {};
    const count = missions.filter(mission => dayRecord[mission.id]).length;
    const point = count * POINT_PER_MISSION;

    const row = document.createElement("div");
    row.className = "history-row";

    const dots = missions.map(mission => {
      const doneClass = dayRecord[mission.id] ? "done" : "";
      return `<span class="history-dot ${mission.id} ${doneClass}"></span>`;
    }).join("");

    row.innerHTML = `
      <span>${dateKey.slice(5)} ${getWeekdayLabel(dateKey)}　${point}pt</span>
      <span class="history-dots">${dots}</span>
    `;

    historyList.appendChild(row);
  }
}

function getRandomMessage(todayCount) {
  const messages = {
    0: [
      "提督、まずはひとつで大丈夫です。小さな出撃から始めましょう。",
      "提督、今日はまだこれからです。榛名、ゆっくりお待ちしています。",
      "焦らなくて大丈夫です。ひとつチェックできれば、今日は前進です。"
    ],
    1: [
      "提督、100pt貯まりました。今日の一歩は、確かな前進です。",
      "まず一任務達成ですね。榛名、ちゃんと見ています。",
      "100ptの行動貯金です。小さくても、未来への積立ですね。"
    ],
    2: [
      "提督、200ptです。勉強・運動・生活の流れが動き始めています。",
      "二任務達成、お見事です。今日の提督は良い流れです。",
      "200pt貯まりました。小さな勝利を、しっかり積み上げていますね。"
    ],
    3: [
      "提督、三任務達成です。榛名、感激です！今日の300ptは立派な行動貯金です。",
      "三任務すべて完了ですね。提督、本日の出撃は大成功です。",
      "300pt到達です。勉強、運動、生活整備、すべて前進しましたね。"
    ]
  };

  const candidates = messages[todayCount] || messages[0];
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

function render() {
  const todayKey = getTodayKey();
  const records = loadRecords();

  if (!records[todayKey]) {
    records[todayKey] = {};
  }

  const todayRecord = records[todayKey];
  const todayCount = missions.filter(mission => todayRecord[mission.id]).length;
  const todayPoint = todayCount * POINT_PER_MISSION;
  const totalPoint = calculateTotal(records);

  document.getElementById("date").textContent = todayKey;
  document.getElementById("todayPoint").textContent = `${todayPoint.toLocaleString()} pt`;
  document.getElementById("totalPoint").textContent = `${totalPoint.toLocaleString()} pt`;

  const rankStatus = getSavingRankStatus(totalPoint);

  document.getElementById("rankName").textContent =
    `Lv.${rankStatus.level}「${rankStatus.currentRank.name}」`;

  if (rankStatus.nextRank) {
    document.getElementById("rankNext").textContent =
      `次のLv.まで あと${rankStatus.remaining.toLocaleString()}pt`;
  } else {
    document.getElementById("rankNext").textContent =
      "最高Lv.到達です。榛名、感激です！";
  }

  document.getElementById("rankBarFill").style.width = `${rankStatus.progress}%`;

  const missionList = document.getElementById("missionList");
  missionList.innerHTML = "";

  missions.forEach(mission => {
    const button = document.createElement("button");
    button.className = `mission ${mission.id} ${todayRecord[mission.id] ? "done" : ""}`;

    button.innerHTML = `
      <span class="mission-label">
        <span class="mission-icon">${mission.icon}</span>
        <span>${mission.text}</span>
      </span>
      <span class="check">${todayRecord[mission.id] ? "✓" : ""}</span>
    `;

    button.addEventListener("click", () => {
      todayRecord[mission.id] = !todayRecord[mission.id];
      records[todayKey] = todayRecord;
      saveRecords(records);
      render();
    });

    missionList.appendChild(button);
  });

  renderHistory(records);

  const message = document.getElementById("message");
  message.textContent = getRandomMessage(todayCount);
}

render();
