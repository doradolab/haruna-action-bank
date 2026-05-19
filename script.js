const missions = [
  { id: "study", text: "勉強のテキストを開く" },
  { id: "squat", text: "スクワット10回" },
  { id: "clean", text: "部屋掃除3分" }
];

const POINT_PER_MISSION = 100;
const STORAGE_KEY = "haruna-action-bank-records";

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
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

  const missionList = document.getElementById("missionList");
  missionList.innerHTML = "";

  missions.forEach(mission => {
    const button = document.createElement("button");
    button.className = `mission ${todayRecord[mission.id] ? "done" : ""}`;
    button.innerHTML = `
      <span>${mission.text}</span>
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

  const message = document.getElementById("message");
  if (todayCount === 0) {
    message.textContent = "提督、まずはひとつで大丈夫です。小さな出撃から始めましょう。";
  } else if (todayCount === 1) {
    message.textContent = "提督、100pt貯まりました。今日の一歩は、確かな前進です。";
  } else if (todayCount === 2) {
    message.textContent = "提督、200ptです。勉強・運動・生活の流れが動き始めています。";
  } else {
    message.textContent = "提督、三任務達成です。榛名、感激です！今日の300ptは立派な行動貯金です。";
  }
}

render();
