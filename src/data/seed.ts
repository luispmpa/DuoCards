import { newFsrsCard } from "../lib/fsrs";
import type {
  Alternative,
  AppData,
  CardKind,
  Difficulty,
  StudyCard,
} from "../types";

const now = () => new Date().toISOString();

function alternatives(...texts: string[]): Alternative[] {
  return texts.map((text, index) => ({
    id: String.fromCharCode(65 + index),
    text,
  }));
}

function card(input: {
  id: string;
  topicId: string;
  question: string;
  alternatives?: Alternative[];
  correctAnswer: string;
  explanation: string;
  distractorNotes?: Record<string, string>;
  source: string;
  tags: string[];
  difficulty?: Difficulty;
  kind?: CardKind;
}): StudyCard {
  const createdAt = now();
  return {
    id: input.id,
    subjectId: "subject_afo",
    topicId: input.topicId,
    kind: input.kind ?? "multiple_choice",
    question: input.question,
    alternatives:
      input.kind === "true_false"
        ? alternatives("Certo", "Errado")
        : (input.alternatives ?? []),
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    distractorNotes: input.distractorNotes ?? {},
    source: input.source,
    tags: input.tags,
    difficulty: input.difficulty ?? "Intermediário",
    active: true,
    schedule: newFsrsCard(),
    history: [],
    createdAt,
    updatedAt: createdAt,
  };
}

export function createSeedData(): AppData {
  const createdAt = now();

  return {
    version: 1,
    profile: {
      name: "Concurseiro",
      goal: 12,
      xp: 0,
      streak: 0,
    },
    subjects: [
      {
        id: "subject_afo",
        name: "Administração Financeira e Orçamentária",
        code: "AFO",
        description:
          "Orçamento público, receitas, despesas, créditos e responsabilidade fiscal.",
        color: "#d9ff67",
        createdAt,
      },
    ],
    topics: [
      {
        id: "topic_principios",
        subjectId: "subject_afo",
        name: "Princípios orçamentários",
        description: "Unidade, universalidade, anualidade e exclusividade.",
        weight: 4,
        createdAt,
      },
      {
        id: "topic_instrumentos",
        subjectId: "subject_afo",
        name: "PPA, LDO e LOA",
        description: "Instrumentos constitucionais de planejamento e orçamento.",
        weight: 5,
        createdAt,
      },
      {
        id: "topic_receita",
        subjectId: "subject_afo",
        name: "Receita pública",
        description: "Classificações e estágios da receita orçamentária.",
        weight: 4,
        createdAt,
      },
      {
        id: "topic_despesa",
        subjectId: "subject_afo",
        name: "Despesa pública",
        description: "Empenho, liquidação, pagamento e restos a pagar.",
        weight: 5,
        createdAt,
      },
      {
        id: "topic_creditos",
        subjectId: "subject_afo",
        name: "Créditos adicionais",
        description: "Suplementares, especiais e extraordinários.",
        weight: 4,
        createdAt,
      },
      {
        id: "topic_lrf",
        subjectId: "subject_afo",
        name: "Lei de Responsabilidade Fiscal",
        description: "Planejamento, transparência e equilíbrio fiscal.",
        weight: 5,
        createdAt,
      },
    ],
    cards: [
      card({
        id: "afo_001",
        topicId: "topic_principios",
        kind: "true_false",
        question:
          "Pelo princípio da universalidade, todas as receitas e despesas de cada ente devem constar da lei orçamentária anual.",
        correctAnswer: "A",
        explanation:
          "Certo. A universalidade exige que o orçamento reúna todas as receitas e todas as despesas do ente. Isso amplia a transparência e permite ao Legislativo avaliar o conjunto das finanças públicas.",
        source: "Lei nº 4.320/1964, arts. 2º, 3º e 4º.",
        tags: ["princípios", "universalidade"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_002",
        topicId: "topic_principios",
        kind: "true_false",
        question:
          "O princípio da exclusividade impede que a LOA contenha autorização para abertura de créditos suplementares.",
        correctAnswer: "B",
        explanation:
          "Errado. A regra é que a LOA não contenha matéria estranha à previsão da receita e à fixação da despesa. A própria Constituição, porém, admite duas exceções: autorização para créditos suplementares e contratação de operações de crédito, inclusive por antecipação de receita.",
        source: "Constituição Federal, art. 165, § 8º.",
        tags: ["princípios", "exclusividade", "pegadinha"],
        difficulty: "Intermediário",
      }),
      card({
        id: "afo_003",
        topicId: "topic_instrumentos",
        question:
          "Qual instrumento estabelece, de forma regionalizada, diretrizes, objetivos e metas da administração pública federal para despesas de capital e programas de duração continuada?",
        alternatives: alternatives(
          "Plano Plurianual (PPA)",
          "Lei de Diretrizes Orçamentárias (LDO)",
          "Lei Orçamentária Anual (LOA)",
          "Relatório de Gestão Fiscal (RGF)",
        ),
        correctAnswer: "A",
        explanation:
          "O PPA organiza o planejamento de médio prazo. Ele estabelece, de forma regionalizada, diretrizes, objetivos e metas para despesas de capital, as delas decorrentes e programas de duração continuada.",
        distractorNotes: {
          B: "A LDO conecta PPA e LOA e orienta a elaboração do orçamento anual.",
          C: "A LOA estima receitas e fixa despesas para o exercício.",
          D: "O RGF é um instrumento de transparência e controle previsto na LRF.",
        },
        source: "Constituição Federal, art. 165, § 1º.",
        tags: ["PPA", "planejamento"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_004",
        topicId: "topic_instrumentos",
        question:
          "Entre as funções constitucionais da LDO está:",
        alternatives: alternatives(
          "Fixar a despesa e estimar a receita do exercício.",
          "Estabelecer metas e prioridades e orientar a elaboração da LOA.",
          "Abrir créditos extraordinários para despesas imprevisíveis.",
          "Instituir todos os fundos públicos da União.",
        ),
        correctAnswer: "B",
        explanation:
          "A LDO faz a ponte entre o planejamento do PPA e o orçamento da LOA: compreende metas e prioridades, estabelece diretrizes de política fiscal, orienta a elaboração da LOA e trata de alterações na legislação tributária, entre outras funções.",
        distractorNotes: {
          A: "Essa é a função central da LOA.",
          C: "Crédito extraordinário é aberto por instrumento próprio, não pela função ordinária da LDO.",
          D: "A criação de fundo exige autorização legislativa, mas não é função geral da LDO.",
        },
        source: "Constituição Federal, art. 165, § 2º.",
        tags: ["LDO", "planejamento"],
      }),
      card({
        id: "afo_005",
        topicId: "topic_instrumentos",
        question:
          "A lei orçamentária anual compreende quais orçamentos?",
        alternatives: alternatives(
          "Somente o fiscal e o da seguridade social.",
          "Fiscal, de investimento das estatais e da seguridade social.",
          "Monetário, cambial e de crédito.",
          "Corrente, de capital e extraorçamentário.",
        ),
        correctAnswer: "B",
        explanation:
          "A LOA compreende o orçamento fiscal; o orçamento de investimento das empresas em que a União detenha, direta ou indiretamente, a maioria do capital social com direito a voto; e o orçamento da seguridade social.",
        distractorNotes: {
          A: "Falta o orçamento de investimento das estatais controladas.",
          C: "Essas categorias não compõem a tripartição constitucional da LOA.",
          D: "São classificações e conceitos distintos dos três orçamentos constitucionais.",
        },
        source: "Constituição Federal, art. 165, § 5º.",
        tags: ["LOA", "orçamentos"],
      }),
      card({
        id: "afo_006",
        topicId: "topic_receita",
        question:
          "Na sequência clássica dos estágios da receita orçamentária, qual alternativa está correta?",
        alternatives: alternatives(
          "Lançamento, previsão, recolhimento e arrecadação.",
          "Previsão, lançamento, arrecadação e recolhimento.",
          "Previsão, arrecadação, empenho e recolhimento.",
          "Fixação, lançamento, liquidação e arrecadação.",
        ),
        correctAnswer: "B",
        explanation:
          "A sequência didática é previsão, lançamento, arrecadação e recolhimento. Atenção: nem toda receita passa pelo lançamento; ele se aplica aos casos previstos em lei, especialmente receitas tributárias.",
        distractorNotes: {
          A: "A previsão antecede a execução e a arrecadação ocorre antes do recolhimento.",
          C: "Empenho é estágio da despesa, não da receita.",
          D: "Fixação e liquidação pertencem ao ciclo da despesa.",
        },
        source:
          "Lei nº 4.320/1964, arts. 51 a 56; Manual de Contabilidade Aplicada ao Setor Público.",
        tags: ["receita", "estágios"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_007",
        topicId: "topic_receita",
        kind: "true_false",
        question:
          "O superávit do orçamento corrente é classificado como receita corrente.",
        correctAnswer: "B",
        explanation:
          "Errado. A Lei nº 4.320/1964 inclui o superávit do orçamento corrente entre as fontes de receitas de capital, mas ressalva expressamente que ele não constitui item de receita orçamentária.",
        source: "Lei nº 4.320/1964, art. 11, § 2º e § 3º.",
        tags: ["receita", "classificação", "pegadinha"],
        difficulty: "Avançado",
      }),
      card({
        id: "afo_008",
        topicId: "topic_despesa",
        question:
          "O estágio da despesa que verifica o direito adquirido pelo credor com base em títulos e documentos comprobatórios é:",
        alternatives: alternatives(
          "Fixação",
          "Empenho",
          "Liquidação",
          "Pagamento",
        ),
        correctAnswer: "C",
        explanation:
          "A liquidação verifica o direito adquirido pelo credor. Nela são apurados a origem e o objeto do que se deve pagar, a importância exata e a quem deve ser pago.",
        distractorNotes: {
          A: "A fixação ocorre na autorização orçamentária.",
          B: "O empenho cria para o Estado obrigação de pagamento, pendente ou não de condição.",
          D: "O pagamento vem depois da regular liquidação.",
        },
        source: "Lei nº 4.320/1964, arts. 62 e 63.",
        tags: ["despesa", "liquidação"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_009",
        topicId: "topic_despesa",
        kind: "true_false",
        question:
          "É vedada a realização de despesa sem prévio empenho.",
        correctAnswer: "A",
        explanation:
          "Certo. O empenho deve preceder a realização da despesa. A nota de empenho pode ser dispensada em casos especiais previstos em legislação, mas isso não elimina o próprio empenho.",
        source: "Lei nº 4.320/1964, art. 60.",
        tags: ["despesa", "empenho"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_010",
        topicId: "topic_despesa",
        question:
          "Uma despesa empenhada e liquidada até 31 de dezembro, mas ainda não paga, será inscrita como:",
        alternatives: alternatives(
          "Restos a pagar processados",
          "Restos a pagar não processados",
          "Despesa de exercício anterior",
          "Crédito especial reaberto",
        ),
        correctAnswer: "A",
        explanation:
          "Restos a pagar são despesas empenhadas e não pagas até 31 de dezembro. Quando a liquidação já ocorreu, são processados; se ainda falta liquidar, são não processados.",
        distractorNotes: {
          B: "Não processado é o empenho que ainda não foi liquidado.",
          C: "Despesa de exercício anterior segue hipótese e reconhecimento próprios.",
          D: "Crédito especial é autorização de despesa sem dotação específica, conceito diferente.",
        },
        source: "Lei nº 4.320/1964, art. 36.",
        tags: ["despesa", "restos a pagar"],
      }),
      card({
        id: "afo_011",
        topicId: "topic_creditos",
        question:
          "Os créditos adicionais destinados a despesas urgentes e imprevisíveis, como as decorrentes de guerra, comoção interna ou calamidade pública, são:",
        alternatives: alternatives(
          "Suplementares",
          "Especiais",
          "Extraordinários",
          "Rotativos",
        ),
        correctAnswer: "C",
        explanation:
          "Créditos extraordinários atendem despesas urgentes e imprevisíveis. A Constituição usa guerra, comoção interna e calamidade pública como exemplos desse requisito.",
        distractorNotes: {
          A: "Suplementar reforça uma dotação já existente.",
          B: "Especial atende despesa sem dotação específica, sem exigir urgência e imprevisibilidade.",
          D: "Crédito rotativo não é espécie de crédito adicional da Lei nº 4.320/1964.",
        },
        source:
          "Constituição Federal, art. 167, § 3º; Lei nº 4.320/1964, art. 41, III.",
        tags: ["créditos adicionais", "extraordinário"],
      }),
      card({
        id: "afo_012",
        topicId: "topic_creditos",
        question:
          "Assinale a correspondência correta entre o crédito adicional e sua finalidade.",
        alternatives: alternatives(
          "Suplementar: despesa sem dotação orçamentária específica.",
          "Especial: reforço de dotação já existente.",
          "Extraordinário: qualquer despesa não prevista na LOA.",
          "Suplementar: reforço de dotação orçamentária.",
        ),
        correctAnswer: "D",
        explanation:
          "O crédito suplementar reforça dotação existente. O especial atende despesa sem dotação específica. O extraordinário é reservado a despesas urgentes e imprevisíveis.",
        distractorNotes: {
          A: "Essa é a finalidade do crédito especial.",
          B: "Essa é a finalidade do crédito suplementar.",
          C: "Não basta a ausência de previsão; são exigidas urgência e imprevisibilidade.",
        },
        source: "Lei nº 4.320/1964, art. 41.",
        tags: ["créditos adicionais", "classificação"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_013",
        topicId: "topic_creditos",
        kind: "true_false",
        question:
          "Créditos especiais e extraordinários autorizados nos últimos quatro meses do exercício podem ser reabertos no exercício seguinte, nos limites de seus saldos.",
        correctAnswer: "A",
        explanation:
          "Certo. Essa é uma exceção ao princípio da anualidade. Se o ato de autorização for promulgado nos últimos quatro meses do exercício, esses créditos podem ser reabertos no exercício seguinte e incorporados ao orçamento.",
        source: "Constituição Federal, art. 167, § 2º.",
        tags: ["créditos adicionais", "vigência", "anualidade"],
        difficulty: "Avançado",
      }),
      card({
        id: "afo_014",
        topicId: "topic_lrf",
        question:
          "Segundo a LRF, a responsabilidade na gestão fiscal pressupõe:",
        alternatives: alternatives(
          "Ação planejada e transparente, com prevenção de riscos e correção de desvios.",
          "Sigilo prévio dos resultados fiscais até o encerramento do mandato.",
          "Equilíbrio apenas das despesas de capital.",
          "Renúncia de receita sem estimativa de impacto, desde que autorizada na LOA.",
        ),
        correctAnswer: "A",
        explanation:
          "A LRF define a gestão fiscal responsável como ação planejada e transparente, voltada à prevenção de riscos e correção de desvios capazes de afetar o equilíbrio das contas públicas, mediante metas e observância de limites e condições.",
        distractorNotes: {
          B: "A transparência é pressuposto expresso da responsabilidade fiscal.",
          C: "O equilíbrio fiscal não se restringe às despesas de capital.",
          D: "A renúncia de receita está sujeita a requisitos, inclusive estimativa de impacto.",
        },
        source: "Lei Complementar nº 101/2000, art. 1º, § 1º.",
        tags: ["LRF", "responsabilidade fiscal"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_015",
        topicId: "topic_lrf",
        kind: "true_false",
        question:
          "A transparência da gestão fiscal é assegurada também mediante incentivo à participação popular e realização de audiências públicas durante os processos de elaboração e discussão dos planos, da LDO e dos orçamentos.",
        correctAnswer: "A",
        explanation:
          "Certo. A participação popular e as audiências públicas integram expressamente os mecanismos de transparência previstos na LRF.",
        source: "Lei Complementar nº 101/2000, art. 48, § 1º, I.",
        tags: ["LRF", "transparência"],
      }),
    ],
    activity: [],
    settings: {
      dailyGoal: 12,
      newCardsPerDay: 8,
      theme: "light",
    },
  };
}
