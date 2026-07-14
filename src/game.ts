import Matter from "matter-js";
import { colorFor } from "./parse";

export interface Participant {
  name: string;
  weight: number;
  image: HTMLImageElement | null;
  color: string;
}

export type WinnerMode = "first" | "last";

interface Marble {
  body: Matter.Body;
  participant: Participant;
  finished: boolean;
  rank: number;
}

interface Spinner {
  body: Matter.Body;
  speed: number;
}

// ---- 코스 상수 (월드 좌표) -------------------------------------------------
const W = 900; // 코스 폭
const WALL = 60;
const START_ZONE_BOTTOM = 380;
const FINISH_Y = 5600;
const FLOOR_Y = 6100;
const MARBLE_RADIUS = 17;

const { Engine, Bodies, Body, Composite, Events } = Matter;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class MarbleGame {
  private engine: Matter.Engine;
  private marbles: Marble[] = [];
  private spinners: Spinner[] = [];
  private pegs: Matter.Body[] = [];
  private statics: Matter.Body[] = [];
  private gate: Matter.Body | null = null;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rafId = 0;
  private lastNudge = 0;

  private camY = 0;
  private running = false;
  private finishCount = 0;
  private mode: WinnerMode = "first";
  private onWinner: (p: Participant) => void;

  constructor(canvas: HTMLCanvasElement, onWinner: (p: Participant) => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;
    this.onWinner = onWinner;
    this.engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.0011 } });
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---- 코스 생성 -----------------------------------------------------------
  setup(participants: Participant[], mode: WinnerMode): void {
    this.teardown();
    this.mode = mode;

    const world = this.engine.world;

    // 좌우 벽 + 바닥
    this.statics = [
      Bodies.rectangle(-WALL / 2, FLOOR_Y / 2, WALL, FLOOR_Y + 800, { isStatic: true }),
      Bodies.rectangle(W + WALL / 2, FLOOR_Y / 2, WALL, FLOOR_Y + 800, { isStatic: true }),
      Bodies.rectangle(W / 2, FLOOR_Y, W + WALL * 2, WALL, { isStatic: true }),
    ];

    // 시작 게이트
    this.gate = Bodies.rectangle(W / 2, START_ZONE_BOTTOM, W, 24, { isStatic: true });
    this.statics.push(this.gate);

    // 구간 1: 지그재그 경사로 (500~1700)
    for (let i = 0; i < 4; i++) {
      const y = 640 + i * 300;
      const fromLeft = i % 2 === 0;
      const len = W * 0.72;
      const angle = fromLeft ? 0.28 : -0.28;
      const x = fromLeft ? len / 2 - 40 : W - len / 2 + 40;
      this.statics.push(
        Bodies.rectangle(x, y, len, 22, { isStatic: true, angle }),
      );
    }

    // 구간 2: 못(peg) 필드 (1900~3400)
    this.pegs = [];
    const rows = 14;
    for (let r = 0; r < rows; r++) {
      const y = 1900 + r * 110;
      const offset = r % 2 === 0 ? 0 : 55;
      for (let x = 70 + offset; x < W - 40; x += 110) {
        this.pegs.push(
          Bodies.circle(x + rand(-14, 14), y + rand(-10, 10), 11, {
            isStatic: true,
            restitution: 0.5,
          }),
        );
      }
    }

    // 구간 3: 회전 십자 장애물 (3650~4600)
    this.spinners = [];
    const spinnerSpots: [number, number][] = [
      [W * 0.28, 3700],
      [W * 0.72, 4000],
      [W * 0.5, 4350],
    ];
    for (const [x, y] of spinnerSpots) {
      const blade1 = Bodies.rectangle(x, y, 260, 18);
      const blade2 = Bodies.rectangle(x, y, 18, 260);
      const cross = Body.create({
        parts: [blade1, blade2],
        isStatic: true,
      });
      Body.setPosition(cross, { x, y });
      this.spinners.push({
        body: cross,
        speed: rand(0.02, 0.035) * (Math.random() < 0.5 ? 1 : -1),
      });
    }

    // 구간 4: 깔때기 (4800~5400)
    const funnelGap = 150;
    this.statics.push(
      Bodies.rectangle(W * 0.22, 5100, W * 0.55, 22, { isStatic: true, angle: 0.5 }),
      Bodies.rectangle(W * 0.78, 5100, W * 0.55, 22, { isStatic: true, angle: -0.5 }),
      Bodies.rectangle(W / 2 - funnelGap / 2 - 60, 5400, 120, 22, { isStatic: true }),
      Bodies.rectangle(W / 2 + funnelGap / 2 + 60, 5400, 120, 22, { isStatic: true }),
    );

    Composite.add(world, [
      ...this.statics,
      ...this.pegs,
      ...this.spinners.map((s) => s.body),
    ]);

    // 구슬 생성 — 가중치만큼 복제
    this.marbles = [];
    for (const participant of participants) {
      for (let i = 0; i < participant.weight; i++) {
        const body = Bodies.circle(
          rand(MARBLE_RADIUS * 2, W - MARBLE_RADIUS * 2),
          rand(40, START_ZONE_BOTTOM - 80),
          MARBLE_RADIUS,
          {
            restitution: 0.55,
            friction: 0.002,
            frictionAir: 0.008,
            density: 0.0012,
          },
        );
        this.marbles.push({ body, participant, finished: false, rank: 0 });
      }
    }
    Composite.add(world, this.marbles.map((m) => m.body));

    this.camY = 0;
    this.running = false;
    this.finishCount = 0;
  }

  private teardown(): void {
    Composite.clear(this.engine.world, false);
    this.marbles = [];
    this.spinners = [];
    this.pegs = [];
    this.statics = [];
    this.gate = null;
  }

  start(): void {
    if (this.running || !this.gate) return;
    Composite.remove(this.engine.world, this.gate);
    this.gate = null;
    this.running = true;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get marbleCount(): number {
    return this.marbles.length;
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    this.teardown();
  }

  // ---- 메인 루프 -----------------------------------------------------------
  private loop(time: number): void {
    if (this.marbles.length > 0) {
      // 회전 장애물 각도 갱신
      for (const spinner of this.spinners) {
        Body.setAngle(spinner.body, spinner.body.angle + spinner.speed);
      }

      if (this.running) {
        Engine.update(this.engine, 1000 / 60);
        this.checkFinish();
        this.nudgeStuck(time);
      }
      this.updateCamera();
    }
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  }

  private checkFinish(): void {
    for (const marble of this.marbles) {
      if (marble.finished) continue;
      if (marble.body.position.y > FINISH_Y) {
        marble.finished = true;
        marble.rank = ++this.finishCount;

        if (this.mode === "first" && marble.rank === 1) {
          this.running = false;
          this.onWinner(marble.participant);
          return;
        }
        if (this.mode === "last" && this.finishCount === this.marbles.length) {
          this.running = false;
          this.onWinner(marble.participant);
          return;
        }
      }
    }
  }

  /** 코스 중간에 멈춘 구슬에 주기적으로 미세한 힘을 줘 정체를 방지한다. */
  private nudgeStuck(time: number): void {
    if (time - this.lastNudge < 2500) return;
    this.lastNudge = time;
    for (const marble of this.marbles) {
      if (marble.finished) continue;
      const v = marble.body.velocity;
      if (Math.abs(v.x) < 0.06 && Math.abs(v.y) < 0.06) {
        Body.applyForce(marble.body, marble.body.position, {
          x: rand(-0.0016, 0.0016),
          y: -0.0011,
        });
      }
    }
  }

  private updateCamera(): void {
    // 선두(가장 아래) 미완주 구슬을 따라간다.
    let leadY = 0;
    let found = false;
    for (const marble of this.marbles) {
      if (marble.finished) continue;
      if (marble.body.position.y > leadY) {
        leadY = marble.body.position.y;
        found = true;
      }
    }
    if (!found) leadY = FINISH_Y;
    const target = Math.max(0, Math.min(leadY - 200, FLOOR_Y - 700));
    this.camY += (target - this.camY) * 0.08;
  }

  // ---- 렌더링 ---------------------------------------------------------------
  private render(): void {
    const { ctx } = this;
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    // 배경
    const bgGradient = ctx.createLinearGradient(0, 0, 0, ch);
    bgGradient.addColorStop(0, "#131730");
    bgGradient.addColorStop(1, "#0d1020");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, cw, ch);

    if (this.marbles.length === 0) {
      ctx.fillStyle = "#5a628f";
      ctx.font = "600 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("왼쪽에서 참가자를 적용하면 코스가 준비됩니다", cw / 2, ch / 2);
      return;
    }

    const zoom = Math.min(cw / (W + WALL), 1.05);
    ctx.save();
    ctx.translate(cw / 2, 0);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -this.camY);

    this.drawFinishLine(ctx);
    this.drawStatics(ctx);
    this.drawSpinners(ctx);
    this.drawPegs(ctx);
    this.drawMarbles(ctx);

    ctx.restore();
    this.drawProgressBar(ctx, cw, ch);
  }

  private drawFinishLine(ctx: CanvasRenderingContext2D): void {
    const size = 22;
    for (let x = 0; x < W; x += size) {
      const even = Math.floor(x / size) % 2 === 0;
      ctx.fillStyle = even ? "#ffffff" : "#1a1e38";
      ctx.fillRect(x, FINISH_Y, size, size / 2);
      ctx.fillStyle = even ? "#1a1e38" : "#ffffff";
      ctx.fillRect(x, FINISH_Y + size / 2, size, size / 2);
    }
  }

  private drawBodyShape(ctx: CanvasRenderingContext2D, body: Matter.Body): void {
    for (const part of body.parts.length > 1 ? body.parts.slice(1) : body.parts) {
      ctx.beginPath();
      const vertices = part.vertices;
      ctx.moveTo(vertices[0]!.x, vertices[0]!.y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i]!.x, vertices[i]!.y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawStatics(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#3a4170";
    for (const body of this.statics) this.drawBodyShape(ctx, body);
  }

  private drawSpinners(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#ff7043";
    for (const spinner of this.spinners) this.drawBodyShape(ctx, spinner.body);
  }

  private drawPegs(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#5c6bc0";
    for (const peg of this.pegs) {
      ctx.beginPath();
      ctx.arc(peg.position.x, peg.position.y, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawMarbles(ctx: CanvasRenderingContext2D): void {
    for (const marble of this.marbles) {
      const { x, y } = marble.body.position;
      const r = MARBLE_RADIUS;
      const { image, color, name } = marble.participant;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.closePath();

      if (image) {
        ctx.save();
        ctx.clip();
        ctx.translate(x, y);
        ctx.rotate(marble.body.angle);
        ctx.drawImage(image, -r, -r, r * 2, r * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.restore();

      // 이름 라벨
      ctx.font = "700 15px sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.strokeText(name, x, y - r - 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(name, x, y - r - 8);
    }
  }

  private drawProgressBar(ctx: CanvasRenderingContext2D, cw: number, ch: number): void {
    const barX = cw - 26;
    const barTop = 24;
    const barHeight = ch - 48;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(barX, barTop, 8, barHeight);

    for (const marble of this.marbles) {
      const progress = Math.max(0, Math.min(1, marble.body.position.y / FINISH_Y));
      ctx.beginPath();
      ctx.arc(barX + 4, barTop + progress * barHeight, 4, 0, Math.PI * 2);
      ctx.fillStyle = marble.participant.color;
      ctx.fill();
    }
  }
}

export function makeParticipant(
  name: string,
  weight: number,
  index: number,
  image: HTMLImageElement | null,
): Participant {
  return { name, weight, image, color: colorFor(index) };
}
