import {
  ArrowRight,
  BarChart3,
  BookCheck,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Cloud,
  CloudOff,
  Download,
  Edit3,
  Flame,
  Gauge,
  GraduationCap,
  Home,
  Layers3,
  Library,
  ListFilter,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  countAvailableEditorialQuestions,
  generateEditorialQuestions,
  type QuestionGenerationOptions,
} from "./data/questionGenerator";
import { createSeedData } from "./data/seed";
import { formatLongDate, isoDate, isDue } from "./lib/date";
import {
  connectWithGoogle,
  disconnectFirebase,
  firebaseConfigured,
  loadCloudData,
  saveCloudData,
  watchFirebaseUser,
} from "./lib/firebase";
import {
  intervalLabel,
  newFsrsCard,
  previewFsrsCard,
  Rating,
  reviewFsrsCard,
  serializeFsrsCard,
  State,
} from "./lib/fsrs";
import type { Grade } from "ts-fsrs";
import { makeId } from "./lib/id";
import {
  clearData,
  downloadBackup,
  loadData,
  parseBackup,
  saveData,
} from "./lib/storage";
import type {
  AppData,
  CardKind,
  Difficulty,
  FirebaseStatus,
  StudyCard,
  Subject,
  Topic,
  View,
} from "./types";

const navItems: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Início", icon: Home },
  { id: "study", label: "Estudar", icon: GraduationCap },
  { id: "content", label: "Conteúdo", icon: Library },
  { id: "progress", label: "Desempenho", icon: BarChart3 },
  { id: "settings", label: "Ajustes", icon: Settings },
];

const ratingMeta = [
  { rating: Rating.Again, label: "De novo", key: "1", tone: "again" },
  { rating: Rating.Hard, label: "Difícil", key: "2", tone: "hard" },
  { rating: Rating.Good, label: "Bom", key: "3", tone: "good" },
  { rating: Rating.Easy, label: "Fácil", key: "4", tone: "easy" },
] as const;

function getTopicName(data: AppData, id: string) {
  return data.topics.find((topic) => topic.id === id)?.name ?? "Sem assunto";
}

function getSubjectName(data: AppData, id: string) {
  return data.subjects.find((subject) => subject.id === id)?.code ?? "—";
}

function dueCards(data: AppData) {
  return data.cards.filter(
    (card) => card.active && isDue(card.schedule.due),
  );
}

function daysAgo(count: number) {
  const date = new Date();
  date.setDate(date.getDate() - count);
  return isoDate(date);
}

function calculateStreak(data: AppData) {
  const last = data.profile.lastStudyDate;
  if (last === isoDate()) return data.profile.streak;
  if (last === daysAgo(1)) return data.profile.streak + 1;
  return 1;
}

function streakLabel(days: number) {
  return `${days} ${days === 1 ? "dia" : "dias"}`;
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [view, setView] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [cloudUid, setCloudUid] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<FirebaseStatus>({
    configured: firebaseConfigured,
    connected: false,
    syncing: false,
    message: firebaseConfigured
      ? "Nuvem disponível — entrar"
      : "Salvo neste navegador",
  });
  const cloudHydrated = useRef(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    return watchFirebaseUser(async (user) => {
      if (!user) {
        setCloudUid(null);
        cloudHydrated.current = false;
        setCloudStatus((current) => ({
          ...current,
          connected: false,
          syncing: false,
          message: firebaseConfigured
            ? "Nuvem disponível — entrar"
            : "Salvo neste navegador",
          userEmail: undefined,
        }));
        return;
      }

      setCloudStatus((current) => ({
        ...current,
        connected: true,
        syncing: true,
        message: "Sincronizando...",
        userEmail: user.email ?? "Conta Google",
      }));

      try {
        const remote = await loadCloudData(user.uid);
        if (remote) setData(remote);
        else await saveCloudData(user.uid, data);
        cloudHydrated.current = true;
        setCloudUid(user.uid);
        setCloudStatus((current) => ({
          ...current,
          connected: true,
          syncing: false,
          message: "Salvo na nuvem",
        }));
      } catch {
        setCloudStatus((current) => ({
          ...current,
          syncing: false,
          message: "Falha na sincronização",
        }));
      }
    });
    // A primeira conexão usa o snapshot local vigente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cloudUid || !cloudHydrated.current) return;
    setCloudStatus((current) => ({
      ...current,
      syncing: true,
      message: "Salvando...",
    }));
    const timeout = window.setTimeout(async () => {
      try {
        await saveCloudData(cloudUid, data);
        setCloudStatus((current) => ({
          ...current,
          syncing: false,
          message: "Salvo na nuvem",
        }));
      } catch {
        setCloudStatus((current) => ({
          ...current,
          syncing: false,
          message: "Sem conexão — salvo localmente",
        }));
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [data, cloudUid]);

  function navigate(nextView: View) {
    setView(nextView);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        open={sidebarOpen}
        data={data}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        <Topbar
          data={data}
          cloudStatus={cloudStatus}
          onMenu={() => setSidebarOpen(true)}
        />

        <div className="page-wrap">
          {view === "home" && (
            <HomeView data={data} onNavigate={navigate} />
          )}
          {view === "study" && (
            <StudyView
              data={data}
              setData={setData}
              onNavigate={navigate}
            />
          )}
          {view === "content" && (
            <ContentView data={data} setData={setData} notify={setToast} />
          )}
          {view === "progress" && <ProgressView data={data} />}
          {view === "settings" && (
            <SettingsView
              data={data}
              setData={setData}
              cloudStatus={cloudStatus}
              setCloudStatus={setCloudStatus}
              notify={setToast}
            />
          )}
        </div>
      </main>

      <MobileNav view={view} onNavigate={navigate} />
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">D</div>
      <div>
        <strong>DuoCards</strong>
        <span>concursos</span>
      </div>
    </div>
  );
}

function Sidebar({
  view,
  open,
  data,
  onNavigate,
  onClose,
}: {
  view: View;
  open: boolean;
  data: AppData;
  onNavigate: (view: View) => void;
  onClose: () => void;
}) {
  const reviewedToday =
    data.activity.find((item) => item.date === isoDate())?.reviewed ?? 0;
  const goal = data.settings.dailyGoal;

  return (
    <>
      {open && <button className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-head">
          <Brand />
          <button className="icon-button sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={20} strokeWidth={2.2} />
                <span>{item.label}</span>
                {item.id === "study" && dueCards(data).length > 0 && (
                  <span className="nav-badge">{dueCards(data).length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-goal">
          <div className="goal-ring small">
            <svg viewBox="0 0 42 42">
              <circle className="ring-track" cx="21" cy="21" r="16" />
              <circle
                className="ring-value"
                cx="21"
                cy="21"
                r="16"
                strokeDasharray={`${Math.min(100, (reviewedToday / goal) * 100)} 100`}
              />
            </svg>
            <Target size={17} />
          </div>
          <div>
            <span>Meta diária</span>
            <strong>
              {reviewedToday}/{goal} revisões
            </strong>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">LP</div>
          <div>
            <strong>{data.profile.name}</strong>
            <span>Nível {Math.max(1, Math.floor(data.profile.xp / 250) + 1)}</span>
          </div>
          <MoreHorizontal size={20} />
        </div>
      </aside>
    </>
  );
}

function Topbar({
  data,
  cloudStatus,
  onMenu,
}: {
  data: AppData;
  cloudStatus: FirebaseStatus;
  onMenu: () => void;
}) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={onMenu}>
        <Menu size={22} />
      </button>
      <div className="mobile-brand">
        <Brand />
      </div>
      <div className="topbar-spacer" />
      <div
        className={`sync-pill ${cloudStatus.connected ? "connected" : ""}`}
        title={cloudStatus.message}
      >
        {cloudStatus.connected ? <Cloud size={15} /> : <CloudOff size={15} />}
        <span>{cloudStatus.message}</span>
      </div>
      <div className="top-stat">
        <Flame size={20} fill="currentColor" />
        <strong>{data.profile.streak}</strong>
      </div>
      <div className="top-stat xp">
        <Zap size={19} fill="currentColor" />
        <strong>{data.profile.xp} XP</strong>
      </div>
    </header>
  );
}

function MobileNav({
  view,
  onNavigate,
}: {
  view: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <nav className="mobile-nav">
      {navItems.slice(0, 4).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={21} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function HomeView({
  data,
  onNavigate,
}: {
  data: AppData;
  onNavigate: (view: View) => void;
}) {
  const due = dueCards(data);
  const today =
    data.activity.find((item) => item.date === isoDate())?.reviewed ?? 0;
  const accuracy = data.activity.length
    ? Math.round(
        (data.activity.reduce((sum, item) => sum + item.correct, 0) /
          Math.max(
            1,
            data.activity.reduce((sum, item) => sum + item.reviewed, 0),
          )) *
          100,
      )
    : 0;
  const learned = data.cards.filter((card) => card.schedule.reps > 0).length;
  const firstName =
    data.profile.name === "Concurseiro"
      ? "Concurseiro"
      : data.profile.name.split(" ")[0];

  return (
    <div className="page home-page">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">{formatLongDate(new Date())}</span>
          <h1>Bom estudo, {firstName}.</h1>
          <p>Um pouco hoje, muito mais perto da aprovação amanhã.</p>
        </div>
        <div className="streak-chip">
          <span className="streak-flame">
            <Flame size={23} fill="currentColor" />
          </span>
          <div>
            <strong>{streakLabel(data.profile.streak)}</strong>
            <span>sequência atual</span>
          </div>
        </div>
      </section>

      <section className="hero-study">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={15} />
            Sessão recomendada
          </span>
          <h2>
            {due.length
              ? `${due.length} questões esperando por você`
              : "Revisões em dia. Belo trabalho!"}
          </h2>
          <p>
            {due.length
              ? "O FSRS ordenou sua fila para revisar cada conceito no momento de maior impacto."
              : "Você pode aproveitar para organizar o conteúdo ou voltar quando novos cards vencerem."}
          </p>
          <button
            className="primary-button light"
            onClick={() => onNavigate(due.length ? "study" : "content")}
          >
            {due.length ? "Começar revisão" : "Ver conteúdo"}
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="brain-card">
            <Brain size={41} />
            <span>FSRS</span>
          </div>
          <div className="mini-card card-a">
            <Check size={18} />
          </div>
          <div className="mini-card card-b">AFO</div>
          <div className="mini-card card-c">
            <Zap size={16} />
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard
          icon={Target}
          tone="lime"
          label="Meta de hoje"
          value={`${today}/${data.settings.dailyGoal}`}
          detail={`${Math.min(100, Math.round((today / data.settings.dailyGoal) * 100))}% concluída`}
          progress={Math.min(100, (today / data.settings.dailyGoal) * 100)}
        />
        <MetricCard
          icon={BookCheck}
          tone="blue"
          label="Cards estudados"
          value={String(learned)}
          detail={`de ${data.cards.filter((card) => card.active).length} ativos`}
        />
        <MetricCard
          icon={Gauge}
          tone="orange"
          label="Taxa de acerto"
          value={`${accuracy}%`}
          detail={accuracy ? "histórico geral" : "comece sua 1ª sessão"}
        />
        <MetricCard
          icon={Flame}
          tone="pink"
          label="Sequência"
          value={streakLabel(data.profile.streak)}
          detail="consistência é vantagem"
        />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Sua trilha</span>
            <h2>Administração Financeira e Orçamentária</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate("content")}>
            Gerenciar conteúdo <ArrowRight size={16} />
          </button>
        </div>

        <div className="topic-grid">
          {data.topics
            .filter((topic) => topic.subjectId === "subject_afo")
            .map((topic, index) => {
              const cards = data.cards.filter(
                (item) => item.topicId === topic.id && item.active,
              );
              const practiced = cards.filter(
                (item) => item.schedule.reps > 0,
              ).length;
              const progress = cards.length
                ? Math.round((practiced / cards.length) * 100)
                : 0;
              return (
                <button
                  className="topic-card"
                  key={topic.id}
                  onClick={() => onNavigate("study")}
                >
                  <div className={`topic-icon topic-${(index % 4) + 1}`}>
                    {index === 0 ? (
                      <ShieldCheck />
                    ) : index === 1 ? (
                      <Layers3 />
                    ) : index === 2 ? (
                      <BarChart3 />
                    ) : (
                      <BookOpen />
                    )}
                  </div>
                  <div className="topic-card-main">
                    <strong>{topic.name}</strong>
                    <span>
                      {practiced} de {cards.length} cards vistos
                    </span>
                    <div className="progress-line">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="topic-percent">{progress}%</span>
                </button>
              );
            })}
        </div>
      </section>

      <section className="insight-card">
        <div className="insight-icon">
          <Brain />
        </div>
        <div>
          <span className="eyebrow">Como o DuoCards aprende com você</span>
          <h3>Acertar é só parte da história</h3>
          <p>
            Depois de cada resposta, você informa o esforço de lembrança. É
            esse sinal — junto ao seu histórico — que o FSRS usa para calcular
            a próxima revisão.
          </p>
        </div>
        <span className="verified-badge">
          <CheckCircle2 size={16} /> FSRS real
        </span>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  tone,
  label,
  value,
  detail,
  progress,
}: {
  icon: typeof Target;
  tone: string;
  label: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={21} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      {progress !== undefined && (
        <div className="progress-line compact">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      <small>{detail}</small>
    </div>
  );
}

function StudyView({
  data,
  setData,
  onNavigate,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  onNavigate: (view: View) => void;
}) {
  const [queue, setQueue] = useState(() =>
    dueCards(data)
      .sort(
        (a, b) =>
          new Date(a.schedule.due).getTime() -
          new Date(b.schedule.due).getTime(),
      )
      .slice(0, Math.max(data.settings.dailyGoal, 10))
      .map((card) => card.id),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt] = useState(Date.now());

  const card = data.cards.find((item) => item.id === queue[index]);
  const topic = card
    ? data.topics.find((item) => item.id === card.topicId)
    : undefined;
  const correct = selected === card?.correctAnswer;
  const preview = useMemo(
    () => (card ? previewFsrsCard(card.schedule) : null),
    [card],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!card) return;
      if (!revealed) {
        const option = card.alternatives[Number(event.key) - 1];
        if (option) setSelected(option.id);
        if (event.key === "Enter" && selected) setRevealed(true);
      } else {
        const meta = ratingMeta.find((item) => item.key === event.key);
        if (meta) submitRating(meta.rating);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, revealed, selected]);

  if (!card && completed === 0) {
    return (
      <div className="page">
        <EmptyState
          icon={CheckCircle2}
          title="Fila zerada. Respira!"
          text="Não há cards vencidos neste momento. O FSRS vai trazê-los de volta na hora certa."
          action="Voltar ao início"
          onAction={() => onNavigate("home")}
        />
      </div>
    );
  }

  if (!card) {
    const accuracy = Math.round((correctCount / Math.max(1, completed)) * 100);
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    return (
      <div className="page">
        <div className="session-complete">
          <div className="complete-burst">
            <Sparkles size={40} />
          </div>
          <span className="eyebrow">Sessão concluída</span>
          <h1>Boa! A memória agradece.</h1>
          <p>
            Suas próximas revisões já foram recalculadas individualmente pelo
            FSRS.
          </p>
          <div className="complete-stats">
            <div>
              <strong>{completed}</strong>
              <span>questões</span>
            </div>
            <div>
              <strong>{accuracy}%</strong>
              <span>acertos</span>
            </div>
            <div>
              <strong>{minutes} min</strong>
              <span>foco</span>
            </div>
            <div>
              <strong>+{completed * 10 + correctCount * 2}</strong>
              <span>XP</span>
            </div>
          </div>
          <button className="primary-button" onClick={() => onNavigate("home")}>
            Voltar ao painel <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  function submitRating(rating: Grade) {
    if (!card || !selected) return;
    const reviewedAt = new Date();
    const result = reviewFsrsCard(card.schedule, rating, reviewedAt);
    const updatedSchedule = serializeFsrsCard(result.card);
    const answerCorrect = selected === card.correctAnswer;

    setData((current) => {
      const date = isoDate(reviewedAt);
      const today = current.activity.find((item) => item.date === date);
      const activity = today
        ? current.activity.map((item) =>
            item.date === date
              ? {
                  ...item,
                  reviewed: item.reviewed + 1,
                  correct: item.correct + (answerCorrect ? 1 : 0),
                  xp: item.xp + 10 + (answerCorrect ? 2 : 0),
                }
              : item,
          )
        : [
            ...current.activity,
            {
              date,
              reviewed: 1,
              correct: answerCorrect ? 1 : 0,
              minutes: 0,
              xp: 10 + (answerCorrect ? 2 : 0),
            },
          ];

      return {
        ...current,
        cards: current.cards.map((item) =>
          item.id === card.id
            ? {
                ...item,
                schedule: updatedSchedule,
                history: [
                  ...item.history,
                  {
                    reviewedAt: reviewedAt.toISOString(),
                    rating,
                    state: updatedSchedule.state,
                    due: updatedSchedule.due,
                    elapsedDays: updatedSchedule.elapsed_days,
                    scheduledDays: updatedSchedule.scheduled_days,
                    answerCorrect,
                  },
                ],
                updatedAt: reviewedAt.toISOString(),
              }
            : item,
        ),
        activity,
        profile: {
          ...current.profile,
          streak: calculateStreak(current),
          lastStudyDate: date,
          xp: current.profile.xp + 10 + (answerCorrect ? 2 : 0),
        },
      };
    });

    setCompleted((value) => value + 1);
    if (answerCorrect) setCorrectCount((value) => value + 1);

    if (rating === Rating.Again) {
      setQueue((current) => [...current, card.id]);
    }

    setIndex((value) => value + 1);
    setSelected(null);
    setRevealed(false);
  }

  const progress = ((index + (revealed ? 0.5 : 0)) / queue.length) * 100;

  return (
    <div className="study-page">
      <header className="study-header">
        <button className="icon-button" onClick={() => onNavigate("home")}>
          <X size={21} />
        </button>
        <div className="study-progress">
          <div className="progress-line">
            <span style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <span>
            {Math.min(index + 1, queue.length)} de {queue.length}
          </span>
        </div>
        <div className="study-xp">
          <Zap size={17} fill="currentColor" /> {completed * 10 + correctCount * 2} XP
        </div>
      </header>

      <div className="study-layout">
        <article className={`question-card ${revealed ? "revealed" : ""}`}>
          <div className="question-meta">
            <span className="subject-pill">
              {getSubjectName(data, card.subjectId)}
            </span>
            <span>{topic?.name}</span>
            <span className="difficulty">{card.difficulty}</span>
          </div>
          <span className="question-type">
            {card.kind === "true_false" ? "Julgue o item" : "Questão objetiva"}
          </span>
          <h1>{card.question}</h1>

          <div className="alternatives">
            {card.alternatives.map((alternative, optionIndex) => {
              const isSelected = selected === alternative.id;
              const isCorrect = alternative.id === card.correctAnswer;
              const className = revealed
                ? isCorrect
                  ? "correct"
                  : isSelected
                    ? "wrong"
                    : ""
                : isSelected
                  ? "selected"
                  : "";

              return (
                <button
                  key={alternative.id}
                  className={`alternative ${className}`}
                  onClick={() => !revealed && setSelected(alternative.id)}
                  disabled={revealed}
                >
                  <span className="alternative-key">{alternative.id}</span>
                  <span>{alternative.text}</span>
                  <kbd>{optionIndex + 1}</kbd>
                  {revealed && isCorrect && <CheckCircle2 size={20} />}
                  {revealed && isSelected && !isCorrect && <X size={20} />}
                </button>
              );
            })}
          </div>

          {!revealed ? (
            <div className="question-action">
              <span>
                <kbd>Enter</kbd> para confirmar
              </span>
              <button
                className="primary-button"
                disabled={!selected}
                onClick={() => setRevealed(true)}
              >
                Confirmar resposta
              </button>
            </div>
          ) : (
            <div className={`feedback-panel ${correct ? "success" : "error"}`}>
              <div className="feedback-title">
                {correct ? <CheckCircle2 /> : <RotateCcw />}
                <div>
                  <strong>{correct ? "Mandou bem!" : "Quase lá."}</strong>
                  <span>
                    {correct
                      ? "Resposta correta."
                      : `A resposta correta é ${card.correctAnswer}.`}
                  </span>
                </div>
              </div>
              <p>{card.explanation}</p>
              {selected &&
                !correct &&
                card.distractorNotes[selected] && (
                  <div className="distractor-note">
                    <strong>Por que sua opção não serve?</strong>
                    {card.distractorNotes[selected]}
                  </div>
                )}
              <div className="source-note">
                <BookOpen size={15} />
                <span>{card.source}</span>
              </div>
            </div>
          )}
        </article>

        {revealed && preview && (
          <aside className="rating-panel">
            <div>
              <span className="eyebrow">Calibre sua memória</span>
              <h2>Como foi lembrar?</h2>
              <p>
                Avalie o esforço real. Isso define o intervalo da próxima
                revisão.
              </p>
            </div>
            <div className="rating-grid">
              {ratingMeta.map((meta) => {
                const next = preview[meta.rating];
                const recommended =
                  (correct && meta.rating === Rating.Good) ||
                  (!correct && meta.rating === Rating.Again);
                return (
                  <button
                    key={meta.rating}
                    className={`rating-button ${meta.tone} ${recommended ? "recommended" : ""}`}
                    onClick={() => submitRating(meta.rating)}
                  >
                    <span>
                      <kbd>{meta.key}</kbd>
                      {meta.label}
                    </span>
                    <strong>
                      {intervalLabel(next.card.due)}
                    </strong>
                    {recommended && <small>Sugerido</small>}
                  </button>
                );
              })}
            </div>
            <div className="fsrs-note">
              <Brain size={17} />
              Intervalos calculados pelo FSRS com base neste card.
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

type EditorState =
  | { kind: "subject"; id?: string }
  | { kind: "topic"; id?: string }
  | { kind: "card"; id?: string }
  | null;

type DeleteState =
  | { kind: "subject"; id: string; name: string }
  | { kind: "topic"; id: string; name: string }
  | { kind: "card"; id: string; name: string }
  | null;

function ContentView({
  data,
  setData,
  notify,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  notify: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleting, setDeleting] = useState<DeleteState>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  const filteredCards = data.cards.filter((card) => {
    const matchesTopic =
      topicFilter === "all" || card.topicId === topicFilter;
    const haystack =
      `${card.question} ${card.tags.join(" ")} ${getTopicName(data, card.topicId)}`.toLowerCase();
    return matchesTopic && haystack.includes(search.toLowerCase());
  });

  function saveSubject(subject: Subject) {
    setData((current) => ({
      ...current,
      subjects: current.subjects.some((item) => item.id === subject.id)
        ? current.subjects.map((item) =>
            item.id === subject.id ? subject : item,
          )
        : [...current.subjects, subject],
    }));
    setEditor(null);
    notify("Matéria salva.");
  }

  function saveTopic(topic: Topic) {
    setData((current) => ({
      ...current,
      topics: current.topics.some((item) => item.id === topic.id)
        ? current.topics.map((item) => (item.id === topic.id ? topic : item))
        : [...current.topics, topic],
    }));
    setEditor(null);
    notify("Assunto salvo.");
  }

  function saveCard(card: StudyCard) {
    setData((current) => ({
      ...current,
      cards: current.cards.some((item) => item.id === card.id)
        ? current.cards.map((item) => (item.id === card.id ? card : item))
        : [...current.cards, card],
    }));
    setEditor(null);
    notify("Card salvo.");
  }

  function confirmDelete() {
    if (!deleting) return;
    setData((current) => {
      if (deleting.kind === "card") {
        return {
          ...current,
          cards: current.cards.filter((item) => item.id !== deleting.id),
        };
      }
      if (deleting.kind === "topic") {
        return {
          ...current,
          topics: current.topics.filter((item) => item.id !== deleting.id),
          cards: current.cards.filter(
            (item) => item.topicId !== deleting.id,
          ),
        };
      }
      const topicIds = current.topics
        .filter((item) => item.subjectId === deleting.id)
        .map((item) => item.id);
      return {
        ...current,
        subjects: current.subjects.filter((item) => item.id !== deleting.id),
        topics: current.topics.filter(
          (item) => item.subjectId !== deleting.id,
        ),
        cards: current.cards.filter(
          (item) =>
            item.subjectId !== deleting.id &&
            !topicIds.includes(item.topicId),
        ),
      };
    });
    setDeleting(null);
    notify("Item removido.");
  }

  function generateQuestions(options: QuestionGenerationOptions) {
    const generated = generateEditorialQuestions(data, options);
    if (!generated.length) {
      notify("Não há questões inéditas com esses filtros.");
      return;
    }

    setData((current) => ({
      ...current,
      cards: [...current.cards, ...generated],
    }));
    setGeneratorOpen(false);
    notify(
      `${generated.length} ${generated.length === 1 ? "questão adicionada" : "questões adicionadas"} à sua fila.`,
    );
  }

  return (
    <div className="page content-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Biblioteca</span>
          <h1>Organize seu conteúdo</h1>
          <p>Matérias, assuntos e questões em uma estrutura simples de manter.</p>
        </div>
        <div className="page-heading-actions">
          <button
            className="secondary-button"
            onClick={() => setEditor({ kind: "card" })}
          >
            <Plus size={18} /> Novo card
          </button>
          <button
            className="primary-button"
            onClick={() => setGeneratorOpen(true)}
          >
            <Sparkles size={18} /> Gerar questões
          </button>
        </div>
      </section>

      <section className="structure-grid">
        <div className="structure-card subject-structure">
          <div className="structure-head">
            <div className="metric-icon lime">
              <BookOpen size={20} />
            </div>
            <div>
              <span>Matérias</span>
              <strong>{data.subjects.length}</strong>
            </div>
            <button
              className="icon-button"
              onClick={() => setEditor({ kind: "subject" })}
              title="Nova matéria"
            >
              <Plus size={19} />
            </button>
          </div>
          <div className="structure-list">
            {data.subjects.map((subject) => (
              <div className="structure-row" key={subject.id}>
                <span
                  className="subject-dot"
                  style={{ background: subject.color }}
                />
                <div>
                  <strong>{subject.code}</strong>
                  <span>{subject.name}</span>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setEditor({ kind: "subject", id: subject.id })}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() =>
                    setDeleting({
                      kind: "subject",
                      id: subject.id,
                      name: subject.name,
                    })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="structure-card">
          <div className="structure-head">
            <div className="metric-icon blue">
              <Layers3 size={20} />
            </div>
            <div>
              <span>Assuntos</span>
              <strong>{data.topics.length}</strong>
            </div>
            <button
              className="icon-button"
              onClick={() => setEditor({ kind: "topic" })}
              title="Novo assunto"
            >
              <Plus size={19} />
            </button>
          </div>
          <div className="structure-list topics-compact">
            {data.topics.slice(0, 6).map((topic) => (
              <div className="structure-row" key={topic.id}>
                <div>
                  <strong>{topic.name}</strong>
                  <span>
                    {
                      data.cards.filter((card) => card.topicId === topic.id)
                        .length
                    }{" "}
                    cards
                  </span>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setEditor({ kind: "topic", id: topic.id })}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() =>
                    setDeleting({
                      kind: "topic",
                      id: topic.id,
                      name: topic.name,
                    })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="authoring-card">
          <div className="authoring-icon">
            <Sparkles size={21} />
          </div>
          <span className="eyebrow">Padrão editorial</span>
          <h3>Uma boa questão ensina mesmo quando você erra.</h3>
          <ul>
            <li>Comando claro e uma habilidade por card</li>
            <li>Distratores plausíveis, sem “pegadinha vazia”</li>
            <li>Explicação da correta e do erro mais provável</li>
            <li>Fonte normativa identificada</li>
          </ul>
        </div>
      </section>

      <section className="content-bank">
        <div className="section-heading bank-heading">
          <div>
            <span className="eyebrow">Banco de questões</span>
            <h2>{data.cards.length} cards cadastrados</h2>
          </div>
          <div className="bank-tools">
            <label className="search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar questão ou tag..."
              />
            </label>
            <label className="select-field">
              <ListFilter size={17} />
              <select
                value={topicFilter}
                onChange={(event) => setTopicFilter(event.target.value)}
              >
                <option value="all">Todos os assuntos</option>
                {data.topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </label>
          </div>
        </div>

        <div className="card-table">
          <div className="table-row table-head">
            <span>Questão</span>
            <span>Assunto</span>
            <span>Status</span>
            <span />
          </div>
          {filteredCards.map((card) => (
            <div className="table-row" key={card.id}>
              <div className="question-cell">
                <span
                  className={`kind-dot ${card.kind === "true_false" ? "true-false" : ""}`}
                >
                  {card.kind === "true_false" ? "C/E" : "ME"}
                </span>
                <div>
                  <strong>{card.question}</strong>
                  <span>
                    {card.difficulty} · {card.tags.slice(0, 2).join(" · ")}
                  </span>
                </div>
              </div>
              <span>{getTopicName(data, card.topicId)}</span>
              <button
                className={`status-toggle ${card.active ? "active" : ""}`}
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    cards: current.cards.map((item) =>
                      item.id === card.id
                        ? {
                            ...item,
                            active: !item.active,
                            updatedAt: new Date().toISOString(),
                          }
                        : item,
                    ),
                  }))
                }
              >
                <i />
                {card.active ? "Ativo" : "Pausado"}
              </button>
              <div className="row-actions">
                <button
                  className="icon-button"
                  onClick={() => setEditor({ kind: "card", id: card.id })}
                >
                  <Edit3 size={17} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() =>
                    setDeleting({
                      kind: "card",
                      id: card.id,
                      name: card.question,
                    })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
          {!filteredCards.length && (
            <div className="table-empty">
              <Search size={24} />
              Nenhum card encontrado.
            </div>
          )}
        </div>
      </section>

      {editor?.kind === "subject" && (
        <Modal title={editor.id ? "Editar matéria" : "Nova matéria"} onClose={() => setEditor(null)}>
          <SubjectForm
            subject={data.subjects.find((item) => item.id === editor.id)}
            onSave={saveSubject}
          />
        </Modal>
      )}
      {editor?.kind === "topic" && (
        <Modal title={editor.id ? "Editar assunto" : "Novo assunto"} onClose={() => setEditor(null)}>
          <TopicForm
            topic={data.topics.find((item) => item.id === editor.id)}
            subjects={data.subjects}
            onSave={saveTopic}
          />
        </Modal>
      )}
      {editor?.kind === "card" && (
        <Modal
          title={editor.id ? "Editar card" : "Novo card"}
          onClose={() => setEditor(null)}
          wide
        >
          <CardForm
            card={data.cards.find((item) => item.id === editor.id)}
            subjects={data.subjects}
            topics={data.topics}
            onSave={saveCard}
          />
        </Modal>
      )}
      {generatorOpen && (
        <Modal
          title="Gerar questões de AFO"
          onClose={() => setGeneratorOpen(false)}
        >
          <QuestionGeneratorForm
            data={data}
            topics={data.topics.filter(
              (topic) => topic.subjectId === "subject_afo",
            )}
            onGenerate={generateQuestions}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmModal
          title={`Remover ${deleting.kind === "card" ? "card" : deleting.kind === "topic" ? "assunto" : "matéria"}?`}
          text={
            deleting.kind === "card"
              ? "O histórico de revisão deste card também será removido."
              : "Os assuntos e cards vinculados também serão removidos. Esta ação não pode ser desfeita."
          }
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <span className="eyebrow">Editor</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubjectForm({
  subject,
  onSave,
}: {
  subject?: Subject;
  onSave: (subject: Subject) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      id: subject?.id ?? makeId("subject"),
      name: String(form.get("name")),
      code: String(form.get("code")).toUpperCase(),
      description: String(form.get("description")),
      color: String(form.get("color")),
      createdAt: subject?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <form className="editor-form" onSubmit={submit}>
      <div className="form-grid two">
        <label>
          <span>Nome da matéria</span>
          <input name="name" defaultValue={subject?.name} required />
        </label>
        <label>
          <span>Sigla</span>
          <input name="code" defaultValue={subject?.code} required maxLength={12} />
        </label>
      </div>
      <label>
        <span>Descrição</span>
        <textarea name="description" defaultValue={subject?.description} rows={3} />
      </label>
      <label>
        <span>Cor da trilha</span>
        <input
          className="color-input"
          name="color"
          type="color"
          defaultValue={subject?.color ?? "#d9ff67"}
        />
      </label>
      <div className="form-actions">
        <button className="primary-button" type="submit">
          Salvar matéria
        </button>
      </div>
    </form>
  );
}

function TopicForm({
  topic,
  subjects,
  onSave,
}: {
  topic?: Topic;
  subjects: Subject[];
  onSave: (topic: Topic) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      id: topic?.id ?? makeId("topic"),
      subjectId: String(form.get("subjectId")),
      name: String(form.get("name")),
      description: String(form.get("description")),
      weight: Number(form.get("weight")),
      createdAt: topic?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <form className="editor-form" onSubmit={submit}>
      <label>
        <span>Matéria</span>
        <select name="subjectId" defaultValue={topic?.subjectId} required>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} — {subject.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Nome do assunto</span>
        <input name="name" defaultValue={topic?.name} required />
      </label>
      <label>
        <span>Descrição</span>
        <textarea name="description" defaultValue={topic?.description} rows={3} />
      </label>
      <label>
        <span>Peso no edital (1–5)</span>
        <input
          name="weight"
          type="number"
          min="1"
          max="5"
          defaultValue={topic?.weight ?? 3}
        />
      </label>
      <div className="form-actions">
        <button className="primary-button" type="submit">
          Salvar assunto
        </button>
      </div>
    </form>
  );
}

function CardForm({
  card,
  subjects,
  topics,
  onSave,
}: {
  card?: StudyCard;
  subjects: Subject[];
  topics: Topic[];
  onSave: (card: StudyCard) => void;
}) {
  const [kind, setKind] = useState<CardKind>(card?.kind ?? "multiple_choice");
  const [subjectId, setSubjectId] = useState(
    card?.subjectId ?? subjects[0]?.id ?? "",
  );
  const filteredTopics = topics.filter((topic) => topic.subjectId === subjectId);
  const initialAlternatives =
    card?.kind === "multiple_choice"
      ? card.alternatives.map((item) => item.text).join("\n")
      : "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const lines = String(form.get("alternatives"))
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const alternatives =
      kind === "true_false"
        ? [
            { id: "A", text: "Certo" },
            { id: "B", text: "Errado" },
          ]
        : lines.map((text, index) => ({
            id: String.fromCharCode(65 + index),
            text,
          }));
    const correctAnswer =
      kind === "true_false"
        ? String(form.get("trueFalseAnswer"))
        : String(form.get("correctAnswer")).toUpperCase();
    const timestamp = new Date().toISOString();

    onSave({
      id: card?.id ?? makeId("card"),
      subjectId,
      topicId: String(form.get("topicId")),
      kind,
      question: String(form.get("question")),
      alternatives,
      correctAnswer,
      explanation: String(form.get("explanation")),
      distractorNotes: card?.distractorNotes ?? {},
      source: String(form.get("source")),
      tags: String(form.get("tags"))
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      difficulty: String(form.get("difficulty")) as Difficulty,
      active: card?.active ?? true,
      schedule: card?.schedule ?? newFsrsCard(),
      history: card?.history ?? [],
      createdAt: card?.createdAt ?? timestamp,
      updatedAt: timestamp,
    });
  }

  return (
    <form className="editor-form" onSubmit={submit}>
      <div className="form-grid three">
        <label>
          <span>Tipo de questão</span>
          <select
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as CardKind)}
          >
            <option value="multiple_choice">Múltipla escolha</option>
            <option value="true_false">Certo ou errado</option>
          </select>
        </label>
        <label>
          <span>Matéria</span>
          <select
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Assunto</span>
          <select name="topicId" defaultValue={card?.topicId} required>
            {filteredTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span>Enunciado</span>
        <textarea
          name="question"
          defaultValue={card?.question}
          rows={4}
          required
          placeholder="Escreva um comando claro, autossuficiente e sem ambiguidade."
        />
      </label>
      {kind === "multiple_choice" ? (
        <div className="form-grid answer-grid">
          <label>
            <span>Alternativas — uma por linha</span>
            <textarea
              name="alternatives"
              defaultValue={initialAlternatives}
              rows={6}
              required
              placeholder={"Primeira alternativa\nSegunda alternativa\nTerceira alternativa\nQuarta alternativa"}
            />
          </label>
          <label>
            <span>Gabarito</span>
            <select
              name="correctAnswer"
              defaultValue={card?.correctAnswer ?? "A"}
            >
              {["A", "B", "C", "D", "E"].map((letter) => (
                <option key={letter} value={letter}>
                  Alternativa {letter}
                </option>
              ))}
            </select>
            <small>Use a letra correspondente à ordem das linhas.</small>
          </label>
        </div>
      ) : (
        <label>
          <span>Gabarito</span>
          <select
            name="trueFalseAnswer"
            defaultValue={card?.correctAnswer ?? "A"}
          >
            <option value="A">Certo</option>
            <option value="B">Errado</option>
          </select>
        </label>
      )}
      <label>
        <span>Explicação comentada</span>
        <textarea
          name="explanation"
          defaultValue={card?.explanation}
          rows={5}
          required
          placeholder="Explique a regra, aplique-a ao enunciado e destaque a armadilha relevante."
        />
      </label>
      <label>
        <span>Fonte</span>
        <input
          name="source"
          defaultValue={card?.source}
          required
          placeholder="Ex.: Constituição Federal, art. 165, § 8º."
        />
      </label>
      <div className="form-grid two">
        <label>
          <span>Tags, separadas por vírgula</span>
          <input name="tags" defaultValue={card?.tags.join(", ")} />
        </label>
        <label>
          <span>Dificuldade</span>
          <select name="difficulty" defaultValue={card?.difficulty ?? "Intermediário"}>
            <option>Básico</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </label>
      </div>
      <div className="editor-tip">
        <CircleHelp size={18} />
        <span>
          <strong>Dica:</strong> um card deve testar uma decisão. Se o
          enunciado exige duas regras independentes, transforme-o em dois.
        </span>
      </div>
      <div className="form-actions">
        <button className="primary-button" type="submit">
          Salvar card
        </button>
      </div>
    </form>
  );
}

function QuestionGeneratorForm({
  data,
  topics,
  onGenerate,
}: {
  data: AppData;
  topics: Topic[];
  onGenerate: (options: QuestionGenerationOptions) => void;
}) {
  const [options, setOptions] = useState<QuestionGenerationOptions>({
    topicId: "all",
    kind: "mixed",
    difficulty: "all",
    count: 5,
  });
  const available = countAvailableEditorialQuestions(data, options);
  const effectiveCount = Math.min(options.count, available);

  function updateOptions(
    partial: Partial<QuestionGenerationOptions>,
  ) {
    setOptions((current) => ({ ...current, ...partial }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!effectiveCount) return;
    onGenerate({ ...options, count: effectiveCount });
  }

  return (
    <form className="editor-form generator-form" onSubmit={submit}>
      <div className="generator-intro">
        <div className="generator-mark">
          <Sparkles size={24} />
        </div>
        <div>
          <strong>Banco editorial verificado</strong>
          <p>
            Questões comentadas com fonte normativa, prontas para entrar no
            FSRS. Funciona sem IA, chave de API ou cobrança.
          </p>
        </div>
      </div>

      <div className="form-grid two">
        <label>
          <span>Assunto</span>
          <select
            value={options.topicId}
            onChange={(event) =>
              updateOptions({ topicId: event.target.value })
            }
          >
            <option value="all">Todos os assuntos</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Formato</span>
          <select
            value={options.kind}
            onChange={(event) =>
              updateOptions({
                kind: event.target.value as QuestionGenerationOptions["kind"],
              })
            }
          >
            <option value="mixed">Misturar formatos</option>
            <option value="multiple_choice">Múltipla escolha</option>
            <option value="true_false">Certo ou errado</option>
          </select>
        </label>
      </div>

      <div className="form-grid two">
        <label>
          <span>Dificuldade</span>
          <select
            value={options.difficulty}
            onChange={(event) =>
              updateOptions({
                difficulty:
                  event.target
                    .value as QuestionGenerationOptions["difficulty"],
              })
            }
          >
            <option value="all">Todas</option>
            <option value="Básico">Básico</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
          </select>
        </label>
        <label>
          <span>Quantidade</span>
          <select
            value={Math.min(options.count, Math.max(1, available))}
            onChange={(event) =>
              updateOptions({ count: Number(event.target.value) })
            }
            disabled={!available}
          >
            {Array.from(
              { length: Math.min(10, Math.max(1, available)) },
              (_, index) => index + 1,
            ).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "questão" : "questões"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={`generator-availability ${available ? "" : "empty"}`}>
        <div>
          <strong>{available}</strong>
          <span>
            {available === 1
              ? "questão inédita disponível"
              : "questões inéditas disponíveis"}
          </span>
        </div>
        <small>
          O gerador nunca adiciona uma questão que já esteja na sua biblioteca.
        </small>
      </div>

      <div className="editor-tip">
        <ShieldCheck size={18} />
        <span>
          <strong>Qualidade primeiro:</strong> cada questão contém gabarito,
          explicação e referência à Constituição, à Lei nº 4.320/1964, à LRF ou
          ao MCASP.
        </span>
      </div>

      <div className="form-actions">
        <button
          className="primary-button"
          type="submit"
          disabled={!available}
        >
          <Sparkles size={17} />
          {available
            ? `Gerar ${effectiveCount} ${effectiveCount === 1 ? "questão" : "questões"}`
            : "Banco esgotado para estes filtros"}
        </button>
      </div>
    </form>
  );
}

function ConfirmModal({
  title,
  text,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal confirm-modal" role="alertdialog" aria-modal="true">
        <div className="danger-mark">
          <Trash2 size={25} />
        </div>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="confirm-actions">
          <button className="secondary-button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="danger-button" onClick={onConfirm}>
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressView({ data }: { data: AppData }) {
  const lastSeven = Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index);
    return (
      data.activity.find((item) => item.date === date) ?? {
        date,
        reviewed: 0,
        correct: 0,
        minutes: 0,
        xp: 0,
      }
    );
  });
  const maxReviewed = Math.max(
    1,
    ...lastSeven.map((item) => item.reviewed),
  );
  const reviews = data.cards.reduce(
    (sum, card) => sum + card.history.length,
    0,
  );
  const correct = data.cards.reduce(
    (sum, card) =>
      sum + card.history.filter((item) => item.answerCorrect).length,
    0,
  );
  const mature = data.cards.filter(
    (card) =>
      card.schedule.state === State.Review && card.schedule.stability >= 21,
  ).length;

  const topicStats = data.topics
    .map((topic) => {
      const cards = data.cards.filter((card) => card.topicId === topic.id);
      const attempts = cards.flatMap((card) => card.history);
      const score = attempts.length
        ? Math.round(
            (attempts.filter((item) => item.answerCorrect).length /
              attempts.length) *
              100,
          )
        : 0;
      return { topic, score, attempts: attempts.length };
    })
    .sort((a, b) => b.attempts - a.attempts);

  return (
    <div className="page progress-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Desempenho</span>
          <h1>Seu progresso, sem ruído</h1>
          <p>Use os dados para decidir onde concentrar a próxima sessão.</p>
        </div>
      </section>

      <section className="metrics-grid progress-metrics">
        <MetricCard
          icon={BookCheck}
          tone="lime"
          label="Revisões"
          value={String(reviews)}
          detail="histórico total"
        />
        <MetricCard
          icon={Target}
          tone="blue"
          label="Precisão"
          value={`${reviews ? Math.round((correct / reviews) * 100) : 0}%`}
          detail="respostas objetivas"
        />
        <MetricCard
          icon={Brain}
          tone="orange"
          label="Cards maduros"
          value={String(mature)}
          detail="estabilidade ≥ 21 dias"
        />
        <MetricCard
          icon={Flame}
          tone="pink"
          label="Maior ativo"
          value={streakLabel(data.profile.streak)}
          detail="sequência atual"
        />
      </section>

      <section className="analytics-grid">
        <div className="analytics-card weekly-chart">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Últimos 7 dias</span>
              <h2>Ritmo de revisões</h2>
            </div>
          </div>
          <div className="bar-chart">
            {lastSeven.map((item) => (
              <div className="bar-column" key={item.date}>
                <div className="bar-value">
                  {item.reviewed > 0 && <span>{item.reviewed}</span>}
                  <i
                    style={{
                      height: `${Math.max(6, (item.reviewed / maxReviewed) * 100)}%`,
                    }}
                  />
                </div>
                <small>
                  {new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
                    .format(new Date(`${item.date}T12:00:00`))
                    .replace(".", "")}
                </small>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Por assunto</span>
              <h2>Domínio observado</h2>
            </div>
          </div>
          <div className="mastery-list">
            {topicStats.map(({ topic, score, attempts }) => (
              <div className="mastery-row" key={topic.id}>
                <div>
                  <strong>{topic.name}</strong>
                  <span>
                    {attempts
                      ? `${attempts} respostas registradas`
                      : "Ainda não estudado"}
                  </span>
                </div>
                <div className="mastery-progress">
                  <div className="progress-line">
                    <span style={{ width: `${score}%` }} />
                  </div>
                  <strong>{score}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingsView({
  data,
  setData,
  cloudStatus,
  setCloudStatus,
  notify,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  cloudStatus: FirebaseStatus;
  setCloudStatus: React.Dispatch<React.SetStateAction<FirebaseStatus>>;
  notify: (message: string) => void;
}) {
  const importRef = useRef<HTMLInputElement>(null);

  function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const dailyGoal = Number(form.get("dailyGoal"));
    setData((current) => ({
      ...current,
      profile: {
        ...current.profile,
        name: String(form.get("name")),
        goal: dailyGoal,
      },
      settings: {
        ...current.settings,
        dailyGoal,
        newCardsPerDay: Number(form.get("newCardsPerDay")),
      },
    }));
    notify("Preferências atualizadas.");
  }

  async function connect() {
    setCloudStatus((current) => ({
      ...current,
      syncing: true,
      message: "Abrindo login...",
    }));
    try {
      await connectWithGoogle();
      notify("Conta conectada.");
    } catch {
      setCloudStatus((current) => ({
        ...current,
        syncing: false,
        message: "Login cancelado ou indisponível",
      }));
    }
  }

  async function importFile(file?: File) {
    if (!file) return;
    try {
      setData(await parseBackup(file));
      notify("Backup importado com sucesso.");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Não foi possível importar.",
      );
    }
  }

  return (
    <div className="page settings-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Ajustes</span>
          <h1>Do seu jeito</h1>
          <p>Personalize a rotina e escolha onde guardar seus dados.</p>
        </div>
      </section>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="metric-icon lime">
              <Target size={20} />
            </div>
            <div>
              <h2>Rotina de estudo</h2>
              <p>Metas pequenas o bastante para repetir todos os dias.</p>
            </div>
          </div>
          <form className="editor-form" onSubmit={savePreferences}>
            <label>
              <span>Como devemos chamar você?</span>
              <input name="name" defaultValue={data.profile.name} />
            </label>
            <div className="form-grid two">
              <label>
                <span>Meta diária de revisões</span>
                <input
                  name="dailyGoal"
                  type="number"
                  min="5"
                  max="100"
                  defaultValue={data.settings.dailyGoal}
                />
              </label>
              <label>
                <span>Novos cards por dia</span>
                <input
                  name="newCardsPerDay"
                  type="number"
                  min="1"
                  max="50"
                  defaultValue={data.settings.newCardsPerDay}
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Salvar preferências
            </button>
          </form>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <div className="metric-icon blue">
              <Cloud size={20} />
            </div>
            <div>
              <h2>Sincronização</h2>
              <p>Firebase no plano gratuito, com acesso protegido por usuário.</p>
            </div>
          </div>

          <div className={`cloud-box ${cloudStatus.connected ? "connected" : ""}`}>
            <div>
              {cloudStatus.connected ? <Cloud size={24} /> : <CloudOff size={24} />}
              <div>
                <strong>
                  {cloudStatus.connected
                    ? cloudStatus.userEmail
                    : firebaseConfigured
                      ? "Nuvem disponível"
                      : "Dados neste navegador"}
                </strong>
                <span>{cloudStatus.message}</span>
              </div>
            </div>
            {firebaseConfigured ? (
              cloudStatus.connected ? (
                <button
                  className="secondary-button"
                  onClick={() => disconnectFirebase()}
                >
                  <LogOut size={16} /> Sair
                </button>
              ) : (
                <button
                  className="secondary-button"
                  onClick={connect}
                  disabled={cloudStatus.syncing}
                >
                  <Cloud size={16} /> Conectar Google
                </button>
              )
            ) : (
              <span className="local-badge">Somente neste dispositivo</span>
            )}
          </div>

          {!firebaseConfigured && (
            <div className="setup-note">
              <CircleHelp size={18} />
              <p>
                Seus cards e seu progresso estão salvos apenas neste navegador.
                Se os dados do site forem apagados ou você trocar de
                dispositivo, use um backup para recuperá-los. Para sincronizar
                automaticamente, configure as variáveis{" "}
                <code>VITE_FIREBASE_*</code> descritas no README e habilite o
                login Google.
              </p>
            </div>
          )}
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <div className="metric-icon orange">
              <Download size={20} />
            </div>
            <div>
              <h2>Seus dados</h2>
              <p>Leve seu conteúdo e histórico com você.</p>
            </div>
          </div>
          <div className="data-actions">
            <button
              className="secondary-button"
              onClick={() => downloadBackup(data)}
            >
              <Download size={17} /> Exportar backup
            </button>
            <button
              className="secondary-button"
              onClick={() => importRef.current?.click()}
            >
              <Upload size={17} /> Importar backup
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => importFile(event.target.files?.[0])}
            />
          </div>
        </section>

        <section className="settings-card danger-zone">
          <div className="settings-card-head">
            <div className="metric-icon pink">
              <Trash2 size={20} />
            </div>
            <div>
              <h2>Recomeçar</h2>
              <p>Apaga dados locais e restaura o conteúdo inicial de AFO.</p>
            </div>
          </div>
          <button
            className="danger-button"
            onClick={() => {
              if (
                window.confirm(
                  "Apagar seu progresso e restaurar os dados iniciais?",
                )
              ) {
                clearData();
                setData(createSeedData());
                notify("Dados iniciais restaurados.");
              }
            }}
          >
            <Trash2 size={17} /> Restaurar aplicativo
          </button>
        </section>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: typeof CheckCircle2;
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={38} />
      </div>
      <h1>{title}</h1>
      <p>{text}</p>
      <button className="primary-button" onClick={onAction}>
        {action} <ArrowRight size={18} />
      </button>
    </div>
  );
}
