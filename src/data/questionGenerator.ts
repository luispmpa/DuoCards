import { newFsrsCard } from "../lib/fsrs";
import type {
  Alternative,
  AppData,
  CardKind,
  Difficulty,
  StudyCard,
} from "../types";

type EditorialQuestion = {
  id: string;
  topicId: string;
  kind: CardKind;
  question: string;
  alternatives: Alternative[];
  correctAnswer: string;
  explanation: string;
  distractorNotes: Record<string, string>;
  source: string;
  tags: string[];
  difficulty: Difficulty;
};

export type QuestionGenerationOptions = {
  topicId: string;
  kind: CardKind | "mixed";
  difficulty: Difficulty | "all";
  count: number;
};

function alternatives(...texts: string[]): Alternative[] {
  return texts.map((text, index) => ({
    id: String.fromCharCode(65 + index),
    text,
  }));
}

function trueFalse(
  id: string,
  topicId: string,
  question: string,
  correct: boolean,
  explanation: string,
  source: string,
  tags: string[],
  difficulty: Difficulty = "Intermediário",
): EditorialQuestion {
  return {
    id,
    topicId,
    kind: "true_false",
    question,
    alternatives: alternatives("Certo", "Errado"),
    correctAnswer: correct ? "A" : "B",
    explanation,
    distractorNotes: {},
    source,
    tags,
    difficulty,
  };
}

export const editorialQuestionBank: EditorialQuestion[] = [
  trueFalse(
    "afo_gen_001",
    "topic_principios",
    "O princípio da unidade determina que cada ente federativo deve possuir um orçamento uno, permitindo uma visão global de suas finanças.",
    true,
    "O princípio da unidade exige que o orçamento de cada ente seja organizado de forma una. A LOA pode compreender os orçamentos fiscal, de investimento e da seguridade social sem perder essa unidade, pois todos integram uma única lei orçamentária.",
    "Lei nº 4.320/1964, art. 2º; Constituição Federal, art. 165, § 5º.",
    ["princípios", "unidade"],
    "Básico",
  ),
  trueFalse(
    "afo_gen_002",
    "topic_principios",
    "Pelo princípio do orçamento bruto, receitas e despesas devem constar da LOA pelos seus totais, vedadas deduções.",
    true,
    "O orçamento bruto impede que valores líquidos escondam o volume real dos fluxos públicos. Por isso, todas as receitas e despesas devem aparecer pelos seus totais, sem deduções.",
    "Lei nº 4.320/1964, art. 6º.",
    ["princípios", "orçamento bruto"],
    "Básico",
  ),
  {
    id: "afo_gen_003",
    topicId: "topic_principios",
    kind: "multiple_choice",
    question:
      "A regra constitucional da não vinculação da receita de impostos significa que:",
    alternatives: alternatives(
      "Nenhuma receita pública pode ter destinação específica.",
      "A receita de impostos, como regra, não pode ser vinculada a órgão, fundo ou despesa, ressalvadas as exceções constitucionais.",
      "Somente taxas podem financiar serviços públicos.",
      "Toda arrecadação de impostos deve ser destinada à seguridade social.",
    ),
    correctAnswer: "B",
    explanation:
      "A não afetação alcança especificamente a receita de impostos e admite as exceções expressamente previstas na Constituição. Ela não proíbe, de modo geral, a vinculação de todas as espécies de receita.",
    distractorNotes: {
      A: "A vedação não alcança indistintamente todas as receitas públicas.",
      C: "Taxas são vinculadas à atividade estatal que justifica sua cobrança, mas isso não define a destinação de todos os tributos.",
      D: "Não existe destinação integral e genérica de impostos à seguridade social.",
    },
    source: "Constituição Federal, art. 167, IV.",
    tags: ["princípios", "não afetação"],
    difficulty: "Intermediário",
  },
  trueFalse(
    "afo_gen_004",
    "topic_principios",
    "O princípio da anualidade associa a previsão das receitas e a fixação das despesas da LOA a um período financeiro determinado.",
    true,
    "A LOA vigora para o exercício financeiro, que no Brasil coincide com o ano civil. O princípio não impede as exceções constitucionais relativas à reabertura de créditos especiais e extraordinários.",
    "Lei nº 4.320/1964, arts. 2º e 34; Constituição Federal, art. 167, § 2º.",
    ["princípios", "anualidade"],
    "Básico",
  ),
  trueFalse(
    "afo_gen_005",
    "topic_instrumentos",
    "Nenhum investimento cuja execução ultrapasse um exercício financeiro pode ser iniciado sem prévia inclusão no PPA ou sem lei que autorize essa inclusão.",
    true,
    "A Constituição exige a inclusão prévia no PPA, ou lei que autorize a inclusão, para investimento com execução superior a um exercício financeiro. O descumprimento pode caracterizar crime de responsabilidade.",
    "Constituição Federal, art. 167, § 1º.",
    ["PPA", "investimentos"],
    "Intermediário",
  ),
  {
    id: "afo_gen_006",
    topicId: "topic_instrumentos",
    kind: "multiple_choice",
    question:
      "De acordo com a LRF, qual anexo integra a Lei de Diretrizes Orçamentárias?",
    alternatives: alternatives(
      "Anexo de Metas Fiscais",
      "Anexo de Créditos Extraordinários",
      "Anexo de Restos a Pagar Processados",
      "Anexo de Auditorias do Tribunal de Contas",
    ),
    correctAnswer: "A",
    explanation:
      "A LDO deve conter o Anexo de Metas Fiscais. A LRF também prevê o Anexo de Riscos Fiscais, que avalia passivos contingentes e outros riscos capazes de afetar as contas públicas.",
    distractorNotes: {
      B: "Créditos extraordinários são autorizações orçamentárias, não um anexo obrigatório da LDO.",
      C: "A LRF exige demonstrativos de restos a pagar em relatórios fiscais, mas não cria esse anexo da LDO.",
      D: "Auditorias dos tribunais não compõem os anexos fiscais obrigatórios da LDO.",
    },
    source: "Lei Complementar nº 101/2000, art. 4º, §§ 1º e 3º.",
    tags: ["LDO", "metas fiscais"],
    difficulty: "Intermediário",
  },
  {
    id: "afo_gen_007",
    topicId: "topic_instrumentos",
    kind: "multiple_choice",
    question:
      "O orçamento de investimento da LOA federal abrange empresas em que a União:",
    alternatives: alternatives(
      "Possua qualquer participação acionária, ainda que minoritária e sem voto.",
      "Detenha, direta ou indiretamente, a maioria do capital social com direito a voto.",
      "Seja apenas credora de longo prazo.",
      "Tenha concedido benefício tributário no exercício.",
    ),
    correctAnswer: "B",
    explanation:
      "O critério constitucional é o controle: entram no orçamento de investimento as empresas em que a União detenha, direta ou indiretamente, a maioria do capital social com direito a voto.",
    distractorNotes: {
      A: "Uma participação minoritária sem controle não satisfaz o critério constitucional.",
      C: "A condição de credora não caracteriza controle societário.",
      D: "Benefício tributário não inclui a empresa no orçamento de investimento.",
    },
    source: "Constituição Federal, art. 165, § 5º, II.",
    tags: ["LOA", "estatais"],
    difficulty: "Intermediário",
  },
  trueFalse(
    "afo_gen_008",
    "topic_instrumentos",
    "A LDO orienta a elaboração da LOA e deve ser compatível com o PPA.",
    true,
    "A LDO funciona como ligação entre o planejamento de médio prazo do PPA e a execução anual da LOA, estabelecendo metas, prioridades e diretrizes para a elaboração do orçamento.",
    "Constituição Federal, art. 165, § 2º; Lei Complementar nº 101/2000, art. 4º.",
    ["LDO", "PPA", "LOA"],
    "Básico",
  ),
  {
    id: "afo_gen_009",
    topicId: "topic_receita",
    kind: "multiple_choice",
    question: "É exemplo de receita corrente:",
    alternatives: alternatives(
      "Alienação de bens",
      "Operação de crédito",
      "Receita patrimonial",
      "Amortização de empréstimos concedidos",
    ),
    correctAnswer: "C",
    explanation:
      "A receita patrimonial integra as receitas correntes. Alienação de bens, operações de crédito e amortização de empréstimos são receitas de capital.",
    distractorNotes: {
      A: "A conversão de bens em espécie é receita de capital.",
      B: "A constituição de dívida gera receita de capital.",
      D: "O retorno do principal de empréstimos concedidos é receita de capital.",
    },
    source: "Lei nº 4.320/1964, art. 11.",
    tags: ["receita", "classificação econômica"],
    difficulty: "Básico",
  },
  {
    id: "afo_gen_010",
    topicId: "topic_receita",
    kind: "multiple_choice",
    question: "Assinale a receita classificada como receita de capital.",
    alternatives: alternatives(
      "Receita de serviços",
      "Receita de contribuições",
      "Transferência corrente",
      "Alienação de bens",
    ),
    correctAnswer: "D",
    explanation:
      "A alienação de bens converte patrimônio em recursos financeiros e é receita de capital. As demais alternativas representam receitas correntes.",
    distractorNotes: {
      A: "Receita de serviços é corrente.",
      B: "Receita de contribuições é corrente.",
      C: "A própria denominação indica a categoria corrente.",
    },
    source: "Lei nº 4.320/1964, art. 11, § 4º.",
    tags: ["receita", "receita de capital"],
    difficulty: "Básico",
  },
  trueFalse(
    "afo_gen_011",
    "topic_receita",
    "Pertencem ao exercício financeiro as receitas nele arrecadadas, ainda que tenham sido previstas em exercício anterior.",
    true,
    "Para o enfoque orçamentário adotado pela Lei nº 4.320/1964, a receita pertence ao exercício em que é arrecadada. É o regime de caixa aplicado à receita orçamentária.",
    "Lei nº 4.320/1964, art. 35, I.",
    ["receita", "regime orçamentário"],
    "Intermediário",
  ),
  trueFalse(
    "afo_gen_012",
    "topic_receita",
    "Ingressos extraorçamentários representam, em regra, disponibilidades de terceiros e não integram a receita orçamentária.",
    true,
    "Ingressos extraorçamentários têm caráter compensatório, como cauções e retenções, e geram obrigação de restituição ou entrega. Por isso, não financiam definitivamente a ação governamental como receita orçamentária.",
    "Lei nº 4.320/1964, art. 3º, parágrafo único; MCASP, Parte I.",
    ["receita", "extraorçamentária"],
    "Intermediário",
  ),
  {
    id: "afo_gen_013",
    topicId: "topic_despesa",
    kind: "multiple_choice",
    question:
      "Qual tipo de empenho é adequado para despesa de valor previamente conhecido e pagamento único?",
    alternatives: alternatives(
      "Ordinário",
      "Estimativo",
      "Global",
      "Extraordinário",
    ),
    correctAnswer: "A",
    explanation:
      "O empenho ordinário é utilizado quando o valor exato da despesa é conhecido e o pagamento ocorre de uma só vez.",
    distractorNotes: {
      B: "O estimativo atende despesas cujo montante não pode ser previamente determinado.",
      C: "O global atende despesas contratuais ou parceladas com valor total conhecido.",
      D: "Extraordinário é espécie de crédito adicional, não de empenho.",
    },
    source: "Lei nº 4.320/1964, arts. 58 a 61; MCASP, Parte I.",
    tags: ["despesa", "empenho ordinário"],
    difficulty: "Básico",
  },
  {
    id: "afo_gen_014",
    topicId: "topic_despesa",
    kind: "multiple_choice",
    question:
      "Para uma despesa contratual parcelada, com valor total conhecido, utiliza-se normalmente o empenho:",
    alternatives: alternatives(
      "Estimativo",
      "Global",
      "Por suprimento",
      "Extraorçamentário",
    ),
    correctAnswer: "B",
    explanation:
      "O empenho global é apropriado para despesas contratuais e outras sujeitas a parcelamento quando o montante total é conhecido.",
    distractorNotes: {
      A: "O estimativo é usado quando não se conhece previamente o valor exato.",
      C: "Suprimento de fundos é regime de adiantamento, não uma modalidade de empenho.",
      D: "Extraorçamentário não é modalidade de empenho.",
    },
    source: "Lei nº 4.320/1964, art. 60, § 3º; MCASP, Parte I.",
    tags: ["despesa", "empenho global"],
    difficulty: "Intermediário",
  },
  {
    id: "afo_gen_015",
    topicId: "topic_despesa",
    kind: "multiple_choice",
    question:
      "Quando o valor exato da despesa não pode ser previamente determinado, como em certas contas de consumo, o empenho indicado é:",
    alternatives: alternatives(
      "Ordinário",
      "Especial",
      "Estimativo",
      "Global",
    ),
    correctAnswer: "C",
    explanation:
      "O empenho estimativo é utilizado para despesas cujo montante não pode ser determinado antecipadamente com exatidão.",
    distractorNotes: {
      A: "O ordinário pressupõe valor exato e pagamento único.",
      B: "Especial é espécie de crédito adicional.",
      D: "O global pressupõe valor total conhecido, ainda que parcelado.",
    },
    source: "Lei nº 4.320/1964, art. 60, § 2º; MCASP, Parte I.",
    tags: ["despesa", "empenho estimativo"],
    difficulty: "Intermediário",
  },
  trueFalse(
    "afo_gen_016",
    "topic_despesa",
    "Despesas de exercícios encerrados, para as quais o orçamento respectivo consignava crédito próprio com saldo suficiente, podem ser pagas à conta de dotação específica de despesas de exercícios anteriores, observada a ordem cronológica.",
    true,
    "A Lei nº 4.320/1964 admite o pagamento de despesas de exercícios anteriores em hipóteses específicas, entre elas a existência de crédito próprio com saldo suficiente no exercício de origem.",
    "Lei nº 4.320/1964, art. 37.",
    ["despesa", "exercícios anteriores"],
    "Avançado",
  ),
  {
    id: "afo_gen_017",
    topicId: "topic_creditos",
    kind: "multiple_choice",
    question:
      "Qual alternativa NÃO representa fonte indicada pela Lei nº 4.320/1964 para abertura de créditos suplementares e especiais?",
    alternatives: alternatives(
      "Superávit financeiro do exercício anterior",
      "Excesso de arrecadação",
      "Anulação de dotações",
      "Inscrição de despesas em restos a pagar",
    ),
    correctAnswer: "D",
    explanation:
      "A inscrição em restos a pagar não gera recurso para abertura de crédito. São fontes legais, entre outras, o superávit financeiro, o excesso de arrecadação, a anulação de dotações e operações de crédito autorizadas.",
    distractorNotes: {
      A: "É fonte expressamente prevista no art. 43.",
      B: "É fonte expressamente prevista no art. 43.",
      C: "A anulação parcial ou total de dotações pode financiar o crédito.",
    },
    source: "Lei nº 4.320/1964, art. 43, § 1º.",
    tags: ["créditos adicionais", "fontes"],
    difficulty: "Intermediário",
  },
  trueFalse(
    "afo_gen_018",
    "topic_creditos",
    "Crédito especial é destinado a despesa para a qual não haja dotação orçamentária específica.",
    true,
    "O crédito especial cria dotação para uma despesa que não possuía previsão específica. Ele difere do suplementar, que apenas reforça uma dotação já existente.",
    "Lei nº 4.320/1964, art. 41, II.",
    ["créditos adicionais", "especial"],
    "Básico",
  ),
  trueFalse(
    "afo_gen_019",
    "topic_creditos",
    "Os créditos suplementares e especiais são autorizados por lei e abertos por decreto do Poder Executivo.",
    true,
    "A autorização legislativa é seguida da abertura por decreto executivo. Para esses créditos também se exige a indicação de recursos disponíveis, conforme a legislação financeira.",
    "Lei nº 4.320/1964, arts. 42 e 43.",
    ["créditos adicionais", "abertura"],
    "Intermediário",
  ),
  {
    id: "afo_gen_020",
    topicId: "topic_creditos",
    kind: "multiple_choice",
    question:
      "No âmbito federal, os créditos extraordinários podem ser abertos por:",
    alternatives: alternatives(
      "Medida provisória, observados os requisitos constitucionais",
      "Portaria do ministro responsável pela despesa",
      "Resolução do Tribunal de Contas da União",
      "Decreto legislativo sem situação de urgência",
    ),
    correctAnswer: "A",
    explanation:
      "Na União, a Constituição admite medida provisória para abertura de crédito extraordinário, desde que presentes urgência e imprevisibilidade.",
    distractorNotes: {
      B: "Portaria ministerial não tem competência para abrir crédito extraordinário.",
      C: "O TCU exerce controle, mas não abre créditos orçamentários.",
      D: "O crédito extraordinário exige urgência e imprevisibilidade.",
    },
    source: "Constituição Federal, arts. 62 e 167, § 3º.",
    tags: ["créditos adicionais", "extraordinário"],
    difficulty: "Intermediário",
  },
  {
    id: "afo_gen_021",
    topicId: "topic_lrf",
    kind: "multiple_choice",
    question:
      "Os limites globais da despesa total com pessoal, em percentual da receita corrente líquida, são:",
    alternatives: alternatives(
      "40% para a União e 50% para estados e municípios",
      "50% para a União e 60% para estados e municípios",
      "60% para todos os entes",
      "50% para todos os entes",
    ),
    correctAnswer: "B",
    explanation:
      "A LRF fixa o limite global de 50% da RCL para a União e de 60% para estados e municípios, com repartição posterior entre Poderes e órgãos.",
    distractorNotes: {
      A: "Esses percentuais não correspondem aos limites globais da LRF.",
      C: "O limite da União é inferior: 50% da RCL.",
      D: "Estados e municípios têm limite global de 60% da RCL.",
    },
    source: "Lei Complementar nº 101/2000, art. 19.",
    tags: ["LRF", "despesa com pessoal"],
    difficulty: "Intermediário",
  },
  trueFalse(
    "afo_gen_022",
    "topic_lrf",
    "O Relatório Resumido da Execução Orçamentária deve ser publicado até trinta dias após o encerramento de cada bimestre.",
    true,
    "O RREO é bimestral e sua publicação deve ocorrer até trinta dias após o encerramento de cada período, permitindo o acompanhamento frequente da execução orçamentária.",
    "Constituição Federal, art. 165, § 3º; Lei Complementar nº 101/2000, art. 52.",
    ["LRF", "RREO"],
    "Básico",
  ),
  trueFalse(
    "afo_gen_023",
    "topic_lrf",
    "O Relatório de Gestão Fiscal é emitido ao final de cada quadrimestre pelos titulares dos Poderes e órgãos indicados na LRF.",
    true,
    "O RGF tem periodicidade quadrimestral e apresenta, entre outros elementos, comparações com limites de pessoal, dívidas, garantias e operações de crédito.",
    "Lei Complementar nº 101/2000, arts. 54 e 55.",
    ["LRF", "RGF"],
    "Básico",
  ),
  {
    id: "afo_gen_024",
    topicId: "topic_lrf",
    kind: "multiple_choice",
    question:
      "A concessão ou ampliação de incentivo tributário que gere renúncia de receita deve, segundo a LRF:",
    alternatives: alternatives(
      "Ser acompanhada de estimativa do impacto orçamentário-financeiro e atender às condições legais aplicáveis.",
      "Ser autorizada apenas por decreto, sem demonstração de impacto.",
      "Produzir efeitos imediatamente, ainda que incompatível com as metas fiscais.",
      "Ser compensada exclusivamente por operação de crédito.",
    ),
    correctAnswer: "A",
    explanation:
      "A LRF exige estimativa do impacto no exercício de início de vigência e nos dois seguintes, observância da LDO e atendimento a uma das condições do art. 14, como demonstração de compatibilidade com as metas ou medidas de compensação.",
    distractorNotes: {
      B: "A estimativa de impacto é requisito expresso.",
      C: "A renúncia deve respeitar o planejamento e as metas fiscais.",
      D: "Operação de crédito não é a forma exclusiva nem ordinária de compensação prevista.",
    },
    source: "Lei Complementar nº 101/2000, art. 14.",
    tags: ["LRF", "renúncia de receita"],
    difficulty: "Avançado",
  },
];

function matchesOptions(
  question: EditorialQuestion,
  options: QuestionGenerationOptions,
) {
  return (
    (options.topicId === "all" || question.topicId === options.topicId) &&
    (options.kind === "mixed" || question.kind === options.kind) &&
    (options.difficulty === "all" ||
      question.difficulty === options.difficulty)
  );
}

function availableQuestions(
  data: AppData,
  options: QuestionGenerationOptions,
) {
  const existingIds = new Set(data.cards.map((card) => card.id));
  return editorialQuestionBank.filter(
    (question) =>
      !existingIds.has(question.id) && matchesOptions(question, options),
  );
}

export function countAvailableEditorialQuestions(
  data: AppData,
  options: QuestionGenerationOptions,
) {
  return availableQuestions(data, options).length;
}

export function generateEditorialQuestions(
  data: AppData,
  options: QuestionGenerationOptions,
): StudyCard[] {
  const timestamp = new Date().toISOString();
  const candidates = [...availableQuestions(data, options)];

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [
      candidates[swapIndex],
      candidates[index],
    ];
  }

  return candidates.slice(0, options.count).map((question) => ({
    ...question,
    subjectId: "subject_afo",
    active: true,
    schedule: newFsrsCard(),
    history: [],
    tags: [...question.tags, "banco editorial"],
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}
