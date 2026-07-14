import { MarbleGame, makeParticipant, type Participant, type WinnerMode } from "./game";
import { parseParticipants, colorFor } from "./parse";
import "./style.css";

const $ = <T extends HTMLElement>(selector: string): T => {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
};

const namesInput = $<HTMLTextAreaElement>("#names-input");
const applyBtn = $<HTMLButtonElement>("#apply-btn");
const participantsBox = $<HTMLDivElement>("#participants");
const winnerModeSelect = $<HTMLSelectElement>("#winner-mode");
const startBtn = $<HTMLButtonElement>("#start-btn");
const resetBtn = $<HTMLButtonElement>("#reset-btn");
const overlay = $<HTMLDivElement>("#winner-overlay");
const winnerName = $<HTMLParagraphElement>("#winner-name");
const winnerImage = $<HTMLDivElement>("#winner-image");
const againBtn = $<HTMLButtonElement>("#again-btn");
const canvas = $<HTMLCanvasElement>("#game-canvas");

/** 이름 → 업로드된 얼굴 이미지. 참가자를 다시 적용해도 유지된다. */
const imageStore = new Map<string, HTMLImageElement>();
let currentParticipants: Participant[] = [];

const game = new MarbleGame(canvas, showWinner);

function showWinner(participant: Participant): void {
  winnerName.textContent = participant.name;
  winnerImage.innerHTML = "";
  if (participant.image) {
    const img = document.createElement("img");
    img.src = participant.image.src;
    img.alt = participant.name;
    winnerImage.appendChild(img);
  } else {
    winnerImage.textContent = "🏆";
  }
  overlay.classList.remove("hidden");
}

function hideWinner(): void {
  overlay.classList.add("hidden");
}

// ---- 이미지 업로드 -----------------------------------------------------------
function pickImage(name: string, onLoaded: () => void): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const previous = imageStore.get(name);
      if (previous && previous.src.startsWith("blob:")) {
        URL.revokeObjectURL(previous.src);
      }
      imageStore.set(name, img);
      onLoaded();
    };
    img.src = url;
  };
  input.click();
}

function removeImage(name: string): void {
  const previous = imageStore.get(name);
  if (previous && previous.src.startsWith("blob:")) {
    URL.revokeObjectURL(previous.src);
  }
  imageStore.delete(name);
}

// ---- 참가자 목록 UI ----------------------------------------------------------
function renderParticipantRows(): void {
  participantsBox.innerHTML = "";
  currentParticipants.forEach((participant) => {
    const row = document.createElement("div");
    row.className = "participant-row";
    row.style.setProperty("--dot", participant.color);

    const avatar = document.createElement("div");
    avatar.className = "participant-avatar";
    avatar.title = "클릭해서 사진 선택";
    if (participant.image) {
      const img = document.createElement("img");
      img.src = participant.image.src;
      img.alt = participant.name;
      avatar.appendChild(img);
    } else {
      avatar.textContent = "🙂";
    }
    avatar.onclick = () => pickImage(participant.name, rebuild);

    const info = document.createElement("div");
    info.className = "participant-info";
    const nameEl = document.createElement("p");
    nameEl.className = "participant-name";
    nameEl.textContent = participant.name;
    const meta = document.createElement("p");
    meta.className = "participant-meta";
    meta.textContent = `구슬 ${participant.weight}개`;
    info.append(nameEl, meta);

    const photoBtn = document.createElement("button");
    photoBtn.className = "photo-btn";
    photoBtn.type = "button";
    if (participant.image) {
      photoBtn.textContent = "사진 제거";
      photoBtn.onclick = () => {
        removeImage(participant.name);
        rebuild();
      };
    } else {
      photoBtn.textContent = "사진 넣기";
      photoBtn.onclick = () => pickImage(participant.name, rebuild);
    }

    row.append(avatar, info, photoBtn);
    participantsBox.appendChild(row);
  });
}

// ---- 게임 준비 / 시작 / 리셋 ---------------------------------------------------
function rebuild(): void {
  const parsed = parseParticipants(namesInput.value);
  currentParticipants = parsed.map((entry, index) =>
    makeParticipant(entry.name, entry.weight, index, imageStore.get(entry.name) ?? null),
  );
  renderParticipantRows();
  hideWinner();

  if (currentParticipants.length >= 2) {
    game.setup(currentParticipants, winnerModeSelect.value as WinnerMode);
    startBtn.disabled = false;
    resetBtn.disabled = false;
  } else {
    startBtn.disabled = true;
    resetBtn.disabled = true;
  }
}

applyBtn.onclick = rebuild;

startBtn.onclick = () => {
  if (game.marbleCount === 0 || game.isRunning) return;
  hideWinner();
  game.start();
  startBtn.disabled = true;
};

resetBtn.onclick = () => {
  hideWinner();
  rebuild();
};

againBtn.onclick = () => {
  hideWinner();
  rebuild();
};

winnerModeSelect.onchange = () => {
  if (currentParticipants.length >= 2) rebuild();
};

// 데모 기본값
namesInput.value = "철수\n영희\n민수\n지연\n현우\n소라";
rebuild();
