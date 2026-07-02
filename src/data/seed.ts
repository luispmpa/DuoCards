import { newFsrsCard } from "../lib/fsrs";
import type {
  Alternative,
  AppData,
  Difficulty,
  LegalBasis,
  MemoryAid,
  StudyCard,
} from "../types";

const now = () => new Date().toISOString();

const OFFICIAL_SOURCES = {
  constitution:
    "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
  law4320: "https://www.planalto.gov.br/ccivil_03/leis/l4320.htm",
  lrf: "https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm",
} as const;

function alternatives(...texts: string[]): Alternative[] {
  return texts.map((text, index) => ({
    id: String.fromCharCode(65 + index),
    text,
  }));
}

function analyses(...texts: string[]) {
  return Object.fromEntries(
    texts.map((text, index) => [String.fromCharCode(65 + index), text]),
  );
}

function card(input: {
  id: string;
  topicId: string;
  question: string;
  alternatives: [string, string, string, string, string];
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  alternativeExplanations: [string, string, string, string, string];
  legalBasis: LegalBasis[];
  memoryAid: MemoryAid;
  source: string;
  sourceUrl: string;
  tags: string[];
  difficulty?: Difficulty;
}): StudyCard {
  const createdAt = now();
  return {
    id: input.id,
    subjectId: "subject_afo",
    topicId: input.topicId,
    kind: "multiple_choice",
    question: input.question,
    alternatives: alternatives(...input.alternatives),
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    distractorNotes: {},
    alternativeExplanations: analyses(...input.alternativeExplanations),
    legalBasis: input.legalBasis,
    memoryAid: input.memoryAid,
    source: input.source,
    sourceUrl: input.sourceUrl,
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
    version: 2,
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
        question:
          "Sobre o princípio orçamentário da universalidade, assinale a alternativa correta.",
        alternatives: [
          "A LOA deve conter todas as receitas e despesas do ente, ressalvados os ingressos extraorçamentários previstos em lei.",
          "A LOA deve registrar apenas receitas tributárias e despesas primárias.",
          "Cada Poder elabora uma LOA autônoma, sem consolidação pelo ente.",
          "Receitas vinculadas podem ser omitidas porque já possuem destinação legal.",
          "A universalidade exige que União, estados e municípios aprovem uma única LOA nacional.",
        ],
        correctAnswer: "A",
        explanation:
          "A universalidade dá ao orçamento uma visão completa das finanças do próprio ente: receitas orçamentárias e despesas orçamentárias devem integrar a LOA. A ressalva técnica fica para ingressos de natureza extraorçamentária, como depósitos e cauções, que representam recursos de terceiros e não receita pública definitiva.",
        alternativeExplanations: [
          "Correta. Os arts. 3º e 4º da Lei nº 4.320/1964 abrangem todas as receitas e despesas, enquanto o parágrafo único do art. 3º exclui operações de crédito por antecipação da receita e outras entradas compensatórias.",
          "Errada. O alcance não se limita à tributação nem às despesas primárias; receitas patrimoniais, de serviços, de capital e demais despesas orçamentárias também integram a LOA.",
          "Errada. Os Poderes participam da elaboração, mas o ente possui uma lei orçamentária que consolida os orçamentos previstos constitucionalmente.",
          "Errada. A vinculação define a destinação do recurso, não autoriza sua ocultação. A receita vinculada continua sujeita à evidenciação orçamentária.",
          "Errada. A universalidade opera dentro de cada ente federativo; a autonomia orçamentária impede a criação de uma única LOA para toda a Federação.",
        ],
        legalBasis: [
          {
            reference: "Lei nº 4.320/1964, arts. 3º e 4º",
            excerpt:
              "A Lei de Orçamentos compreenderá todas as receitas [...] e todas as despesas próprias dos órgãos.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "UNI-VERSAL = universo inteiro do ente",
          content:
            "UNIVERSALIDADE → todas as receitas + todas as despesas orçamentárias. Pense no orçamento como o “universo financeiro” de cada ente.",
        },
        source: "Lei nº 4.320/1964, arts. 2º, 3º e 4º.",
        sourceUrl: OFFICIAL_SOURCES.law4320,
        tags: ["princípios", "universalidade"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_002",
        topicId: "topic_principios",
        question:
          "A Constituição admite exceções ao princípio da exclusividade da LOA. Assinale a alternativa que reúne corretamente essas exceções.",
        alternatives: [
          "Criação de tributos e instituição de fundos públicos.",
          "Autorização para créditos suplementares e contratação de operações de crédito, inclusive por antecipação de receita.",
          "Abertura de créditos especiais e alteração da legislação tributária.",
          "Fixação de subsídios e criação de cargos públicos.",
          "Concessão de garantias e abertura de créditos extraordinários.",
        ],
        correctAnswer: "B",
        explanation:
          "A LOA não deve conter matéria estranha à previsão da receita e à fixação da despesa. O próprio art. 165, § 8º, da Constituição abre duas exceções expressas: autorização para abertura de créditos suplementares e autorização para contratação de operações de crédito, inclusive ARO. A banca costuma trocar “suplementares” por “especiais” ou “extraordinários”.",
        alternativeExplanations: [
          "Errada. Criação de tributo e instituição de fundo dependem de disciplina legislativa própria e não figuram entre as duas exceções constitucionais.",
          "Correta. A alternativa reproduz as duas ressalvas do art. 165, § 8º: créditos suplementares e operações de crédito, inclusive antecipação da receita orçamentária.",
          "Errada. Alterações tributárias são tratadas pela LDO; créditos especiais não integram a exceção textual ao princípio da exclusividade.",
          "Errada. Subsídios e cargos podem gerar despesa, mas sua criação normativa não é matéria autorizada como exceção dentro da LOA.",
          "Errada. A Constituição não enumera garantias nem créditos extraordinários como exceções à exclusividade da lei orçamentária anual.",
        ],
        legalBasis: [
          {
            reference: "Constituição Federal, art. 165, § 8º",
            excerpt:
              "Não se incluindo na proibição a autorização para abertura de créditos suplementares e contratação de operações de crédito.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "Exclusividade tem duas saídas: SU + OC",
          content:
            "SU = crédito SUplementar. OC = Operação de Crédito, inclusive ARO. Se a alternativa trouxer especial ou extraordinário, desconfie.",
        },
        source: "Constituição Federal, art. 165, § 8º.",
        sourceUrl: OFFICIAL_SOURCES.constitution,
        tags: ["princípios", "exclusividade", "pegadinha"],
      }),
      card({
        id: "afo_003",
        topicId: "topic_instrumentos",
        question:
          "Qual instrumento estabelece, de forma regionalizada, diretrizes, objetivos e metas para despesas de capital, as delas decorrentes e programas de duração continuada?",
        alternatives: [
          "Plano Plurianual (PPA).",
          "Lei de Diretrizes Orçamentárias (LDO).",
          "Lei Orçamentária Anual (LOA).",
          "Relatório Resumido da Execução Orçamentária (RREO).",
          "Relatório de Gestão Fiscal (RGF).",
        ],
        correctAnswer: "A",
        explanation:
          "O PPA é o instrumento constitucional de planejamento de médio prazo. A expressão-chave cobrada em prova é: “de forma regionalizada, diretrizes, objetivos e metas” para despesas de capital, despesas delas decorrentes e programas de duração continuada. LDO e LOA fazem o desdobramento anual desse planejamento.",
        alternativeExplanations: [
          "Correta. O art. 165, § 1º, atribui exatamente esse conteúdo ao PPA e exige a apresentação regionalizada do planejamento federal.",
          "Errada. A LDO define metas e prioridades para o exercício seguinte, orienta a LOA e estabelece diretrizes de política fiscal.",
          "Errada. A LOA estima receitas e fixa despesas para um exercício, materializando financeiramente o planejamento.",
          "Errada. O RREO acompanha bimestralmente a execução do orçamento; não institui diretrizes plurianuais.",
          "Errada. O RGF demonstra o cumprimento de limites fiscais por Poder ou órgão, especialmente pessoal, dívida e operações de crédito.",
        ],
        legalBasis: [
          {
            reference: "Constituição Federal, art. 165, § 1º",
            excerpt:
              "A lei que instituir o plano plurianual estabelecerá, de forma regionalizada, as diretrizes, objetivos e metas.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "PPA = DOM regionalizado",
          content:
            "D = Diretrizes; O = Objetivos; M = Metas. O PPA organiza o DOM de forma regionalizada e olha despesas de capital + programas continuados.",
        },
        source: "Constituição Federal, art. 165, § 1º.",
        sourceUrl: OFFICIAL_SOURCES.constitution,
        tags: ["PPA", "planejamento"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_004",
        topicId: "topic_instrumentos",
        question:
          "Entre as funções constitucionais da Lei de Diretrizes Orçamentárias, encontra-se:",
        alternatives: [
          "Estimar receitas e fixar todas as despesas do exercício.",
          "Estabelecer metas e prioridades, diretrizes de política fiscal e orientar a elaboração da LOA.",
          "Criar diretamente créditos extraordinários para qualquer despesa não prevista.",
          "Substituir o PPA quando houver mudança de governo.",
          "Consolidar exclusivamente os balanços patrimoniais das empresas estatais.",
        ],
        correctAnswer: "B",
        explanation:
          "A LDO funciona como ponte entre o planejamento do PPA e o orçamento anual. Ela compreende metas e prioridades, estabelece diretrizes de política fiscal e respectivas metas, orienta a elaboração da LOA, dispõe sobre alterações tributárias e estabelece a política de aplicação das agências financeiras oficiais de fomento.",
        alternativeExplanations: [
          "Errada. Estimar receitas e fixar despesas é a função típica da LOA, não da LDO.",
          "Correta. A alternativa sintetiza o núcleo do art. 165, § 2º, após a redação dada pela EC nº 109/2021.",
          "Errada. Créditos extraordinários exigem urgência e imprevisibilidade e são abertos por instrumento específico; não são função ordinária da LDO.",
          "Errada. A LDO não substitui o PPA. Os três instrumentos coexistem e devem manter compatibilidade entre planejamento e orçamento.",
          "Errada. A consolidação contábil não define a função constitucional da LDO e tampouco se restringe às empresas estatais.",
        ],
        legalBasis: [
          {
            reference: "Constituição Federal, art. 165, § 2º",
            excerpt:
              "A lei de diretrizes orçamentárias compreenderá as metas e prioridades da administração pública federal.",
          },
        ],
        memoryAid: {
          type: "Esquema",
          title: "PPA → LDO → LOA",
          content:
            "PPA planeja o médio prazo → LDO escolhe prioridades e orienta → LOA entrega autorização financeira anual.",
        },
        source: "Constituição Federal, art. 165, § 2º.",
        sourceUrl: OFFICIAL_SOURCES.constitution,
        tags: ["LDO", "planejamento"],
      }),
      card({
        id: "afo_005",
        topicId: "topic_instrumentos",
        question:
          "Nos termos da Constituição, a Lei Orçamentária Anual da União compreende:",
        alternatives: [
          "Apenas o orçamento fiscal e o da seguridade social.",
          "Os orçamentos fiscal, de investimento das estatais controladas e da seguridade social.",
          "Os orçamentos monetário, cambial, fiscal e creditício.",
          "Um orçamento para cada Poder, aprovado em leis autônomas.",
          "Somente o orçamento de investimento e o orçamento-programa.",
        ],
        correctAnswer: "B",
        explanation:
          "A LOA federal reúne três peças: orçamento fiscal; orçamento de investimento das empresas em que a União detenha, direta ou indiretamente, maioria do capital votante; e orçamento da seguridade social. A existência de três orçamentos dentro de uma única lei preserva o princípio da unidade.",
        alternativeExplanations: [
          "Errada. A enumeração está incompleta porque omite o orçamento de investimento das empresas estatais controladas.",
          "Correta. A alternativa corresponde aos três incisos do art. 165, § 5º, da Constituição.",
          "Errada. Política monetária, cambial e creditícia não compõe a tripartição constitucional da LOA.",
          "Errada. Os Poderes encaminham propostas setoriais, mas os orçamentos são consolidados em uma única lei orçamentária.",
          "Errada. “Orçamento-programa” é uma técnica de organização e não substitui os três orçamentos previstos pela Constituição.",
        ],
        legalBasis: [
          {
            reference: "Constituição Federal, art. 165, § 5º",
            excerpt:
              "A lei orçamentária anual compreenderá: I - o orçamento fiscal; II - o orçamento de investimento; III - o orçamento da seguridade social.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "LOA = FIS",
          content:
            "F = Fiscal; I = Investimento das estatais controladas; S = Seguridade social. Uma lei, três orçamentos.",
        },
        source: "Constituição Federal, art. 165, § 5º.",
        sourceUrl: OFFICIAL_SOURCES.constitution,
        tags: ["LOA", "orçamentos"],
      }),
      card({
        id: "afo_006",
        topicId: "topic_receita",
        question:
          "Na sequência didática dos estágios da receita orçamentária, assinale a ordem correta.",
        alternatives: [
          "Lançamento → previsão → recolhimento → arrecadação.",
          "Previsão → lançamento → arrecadação → recolhimento.",
          "Previsão → arrecadação → empenho → recolhimento.",
          "Fixação → lançamento → liquidação → arrecadação.",
          "Arrecadação → previsão → lançamento → pagamento.",
        ],
        correctAnswer: "B",
        explanation:
          "A sequência clássica usada em concursos é previsão, lançamento, arrecadação e recolhimento. A previsão integra o planejamento; o lançamento identifica o crédito e o devedor quando aplicável; a arrecadação ocorre com o recebimento pelo agente arrecadador; e o recolhimento transfere o produto arrecadado à conta do Tesouro.",
        alternativeExplanations: [
          "Errada. A previsão antecede a execução, e a arrecadação deve ocorrer antes do recolhimento aos cofres públicos.",
          "Correta. A ordem PLARe é a sequência didática consagrada, embora nem toda receita percorra o estágio do lançamento.",
          "Errada. Empenho pertence ao ciclo da despesa e não pode ser inserido entre os estágios da receita.",
          "Errada. Fixação e liquidação são estágios associados à despesa pública.",
          "Errada. Pagamento é estágio da despesa, e a previsão não ocorre depois da arrecadação.",
        ],
        legalBasis: [
          {
            reference: "Lei nº 4.320/1964, arts. 51 a 56",
            excerpt:
              "O recolhimento de todas as receitas far-se-á em estrita observância ao princípio de unidade de tesouraria.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "Receita faz PLARe",
          content:
            "P = Previsão; L = Lançamento; A = Arrecadação; Re = Recolhimento. Nem toda receita é lançada, mas toda arrecadação vem antes do recolhimento.",
        },
        source: "Lei nº 4.320/1964, arts. 51 a 56.",
        sourceUrl: OFFICIAL_SOURCES.law4320,
        tags: ["receita", "estágios"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_007",
        topicId: "topic_receita",
        question:
          "A respeito do superávit do orçamento corrente, assinale a alternativa correta.",
        alternatives: [
          "É receita corrente tributária.",
          "É receita de capital e constitui item autônomo de receita orçamentária.",
          "É classificado como receita extraorçamentária restituível.",
          "Resulta do balanceamento entre receitas e despesas correntes e não constitui item de receita orçamentária.",
          "Corresponde necessariamente ao superávit financeiro do balanço patrimonial.",
        ],
        correctAnswer: "D",
        explanation:
          "A Lei nº 4.320/1964 inclui o superávit do orçamento corrente entre os recursos que financiam despesas de capital, mas afirma expressamente que ele não constitui item de receita orçamentária. Não o confunda com superávit financeiro, apurado no balanço patrimonial e usado como fonte para créditos adicionais.",
        alternativeExplanations: [
          "Errada. O superávit decorre do confronto entre receitas e despesas correntes; não é uma espécie de receita tributária.",
          "Errada. Embora apareça no contexto das receitas de capital, a lei ressalva que ele não é item de receita orçamentária.",
          "Errada. Não se trata de entrada compensatória de terceiros nem de valor sujeito a restituição.",
          "Correta. A alternativa reproduz a natureza do superávit do orçamento corrente e a ressalva legal do art. 11, § 3º.",
          "Errada. Superávit corrente e superávit financeiro possuem conceitos, momentos de apuração e finalidades diferentes.",
        ],
        legalBasis: [
          {
            reference: "Lei nº 4.320/1964, art. 11, § 3º",
            excerpt:
              "O superávit do Orçamento Corrente resultante do balanceamento dos totais [...] não constituirá item de receita orçamentária.",
          },
        ],
        memoryAid: {
          type: "Quadro comparativo",
          title: "Corrente não é Financeiro",
          content:
            "Superávit corrente = receitas correntes − despesas correntes; não é item de receita. Superávit financeiro = ativo financeiro − passivo financeiro ajustado; fonte para crédito adicional.",
        },
        source: "Lei nº 4.320/1964, art. 11, §§ 2º e 3º.",
        sourceUrl: OFFICIAL_SOURCES.law4320,
        tags: ["receita", "classificação", "pegadinha"],
        difficulty: "Avançado",
      }),
      card({
        id: "afo_008",
        topicId: "topic_despesa",
        question:
          "Qual estágio da despesa verifica o direito adquirido pelo credor com base nos títulos e documentos comprobatórios do respectivo crédito?",
        alternatives: [
          "Fixação.",
          "Empenho.",
          "Liquidação.",
          "Pagamento.",
          "Programação financeira.",
        ],
        correctAnswer: "C",
        explanation:
          "A liquidação verifica se o credor cumpriu a obrigação e apura origem e objeto do que se deve pagar, importância exata e beneficiário. O pagamento só pode ser ordenado depois dessa verificação. Em prova, associe “direito adquirido pelo credor” diretamente à liquidação.",
        alternativeExplanations: [
          "Errada. Fixação é a autorização e quantificação da despesa na lei orçamentária.",
          "Errada. Empenho reserva dotação e cria obrigação de pagamento pendente ou não de condição; ainda não comprova a entrega.",
          "Correta. A definição corresponde ao caput do art. 63 da Lei nº 4.320/1964.",
          "Errada. Pagamento é a entrega do numerário ao credor após regular liquidação e ordem de pagamento.",
          "Errada. Programação financeira organiza o fluxo de caixa e o cronograma de desembolso, não atesta o direito do credor.",
        ],
        legalBasis: [
          {
            reference: "Lei nº 4.320/1964, art. 63",
            excerpt:
              "A liquidação da despesa consiste na verificação do direito adquirido pelo credor.",
          },
        ],
        memoryAid: {
          type: "Esquema",
          title: "Empenhou, entregou, liquidou, pagou",
          content:
            "EMPENHO reserva → fornecedor ENTREGA → LIQUIDAÇÃO confere o direito → PAGAMENTO quita.",
        },
        source: "Lei nº 4.320/1964, arts. 62 e 63.",
        sourceUrl: OFFICIAL_SOURCES.law4320,
        tags: ["despesa", "liquidação"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_009",
        topicId: "topic_despesa",
        question:
          "Sobre o empenho da despesa pública, assinale a alternativa correta.",
        alternatives: [
          "A despesa pode ser realizada antes do empenho sempre que houver saldo financeiro.",
          "A emissão da nota de empenho e o próprio empenho são conceitos idênticos e sempre inseparáveis.",
          "É vedada a realização de despesa sem prévio empenho, embora a nota de empenho possa ser dispensada em casos especiais previstos em lei.",
          "O empenho somente ocorre depois da liquidação.",
          "O empenho estimativo é proibido pela Lei nº 4.320/1964.",
        ],
        correctAnswer: "C",
        explanation:
          "A regra central é a anterioridade do empenho: não se realiza despesa sem prévio empenho. A pegadinha está em confundir o ato de empenhar com o documento “nota de empenho”. A lei pode dispensar a emissão da nota em situações especiais, mas não elimina a necessidade do empenho.",
        alternativeExplanations: [
          "Errada. Disponibilidade financeira não substitui autorização orçamentária nem afasta a exigência de empenho prévio.",
          "Errada. Empenho é o ato da autoridade competente; nota de empenho é o documento que o materializa.",
          "Correta. A alternativa harmoniza o caput e o § 1º do art. 60 da Lei nº 4.320/1964.",
          "Errada. A ordem normal é empenho antes da liquidação; primeiro se compromete a dotação, depois se verifica o direito do credor.",
          "Errada. O § 2º do art. 60 admite empenho por estimativa quando o montante da despesa não puder ser previamente determinado.",
        ],
        legalBasis: [
          {
            reference: "Lei nº 4.320/1964, art. 60",
            excerpt: "É vedada a realização de despesa sem prévio empenho.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "Sem empenho, sem despesa",
          content:
            "Empenho é obrigatório e prévio. Nota de empenho é o papel: excepcionalmente dispensável. A banca troca o ato pelo documento.",
        },
        source: "Lei nº 4.320/1964, art. 60.",
        sourceUrl: OFFICIAL_SOURCES.law4320,
        tags: ["despesa", "empenho"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_010",
        topicId: "topic_despesa",
        question:
          "Uma despesa foi empenhada e liquidada até 31 de dezembro, mas não foi paga. Como ela será classificada?",
        alternatives: [
          "Restos a pagar processados.",
          "Restos a pagar não processados.",
          "Despesa de exercício anterior.",
          "Crédito especial reaberto.",
          "Passivo contingente sem execução orçamentária.",
        ],
        correctAnswer: "A",
        explanation:
          "Restos a pagar são despesas empenhadas e não pagas até 31 de dezembro. Quando já houve liquidação, o credor comprovou o direito e o resto a pagar é processado. Se há apenas empenho, sem liquidação, ele é não processado. A palavra “processado” aponta para a liquidação concluída.",
        alternativeExplanations: [
          "Correta. Empenho + liquidação + ausência de pagamento até o encerramento do exercício caracteriza resto a pagar processado.",
          "Errada. O resto não processado ainda aguarda liquidação, isto é, a verificação do direito do credor.",
          "Errada. Despesa de exercício anterior atende hipóteses próprias do art. 37 e não substitui automaticamente um empenho válido inscrito em restos a pagar.",
          "Errada. Reabertura de crédito especial diz respeito à vigência de autorização orçamentária, não à classificação de obrigação já liquidada.",
          "Errada. A obrigação é reconhecida e liquidada; não é mera contingência nem está fora da execução orçamentária.",
        ],
        legalBasis: [
          {
            reference: "Lei nº 4.320/1964, art. 36",
            excerpt:
              "Consideram-se Restos a Pagar as despesas empenhadas mas não pagas até o dia 31 de dezembro.",
          },
        ],
        memoryAid: {
          type: "Quadro comparativo",
          title: "Processado passou pela liquidação",
          content:
            "RP processado = empenhado + liquidado + não pago. RP não processado = empenhado + ainda não liquidado.",
        },
        source: "Lei nº 4.320/1964, art. 36.",
        sourceUrl: OFFICIAL_SOURCES.law4320,
        tags: ["despesa", "restos a pagar"],
      }),
      card({
        id: "afo_011",
        topicId: "topic_creditos",
        question:
          "Os créditos adicionais destinados a despesas urgentes e imprevisíveis, como guerra, comoção interna ou calamidade pública, são denominados:",
        alternatives: [
          "Suplementares.",
          "Especiais.",
          "Extraordinários.",
          "Rotativos.",
          "Extraorçamentários.",
        ],
        correctAnswer: "C",
        explanation:
          "Créditos extraordinários atendem simultaneamente aos requisitos de urgência e imprevisibilidade. Guerra, comoção interna e calamidade pública são exemplos constitucionais. A simples inexistência de dotação não basta: sem urgência e imprevisibilidade, a espécie normalmente será crédito especial.",
        alternativeExplanations: [
          "Errada. Crédito suplementar apenas reforça dotação orçamentária já existente.",
          "Errada. Crédito especial cria dotação para despesa sem previsão específica, mas não pressupõe urgência e imprevisibilidade.",
          "Correta. A definição combina o art. 41, III, da Lei nº 4.320/1964 com o art. 167, § 3º, da Constituição.",
          "Errada. Crédito rotativo não integra as três espécies legais de créditos adicionais.",
          "Errada. Extraorçamentário qualifica determinados ingressos ou dispêndios compensatórios, não uma espécie de crédito adicional.",
        ],
        legalBasis: [
          {
            reference: "Constituição Federal, art. 167, § 3º",
            excerpt:
              "A abertura de crédito extraordinário somente será admitida para atender a despesas imprevisíveis e urgentes.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "Extraordinário = UI!",
          content:
            "U = Urgente; I = Imprevisível. O ponto de exclamação lembra guerra, comoção interna e calamidade pública.",
        },
        source:
          "Constituição Federal, art. 167, § 3º; Lei nº 4.320/1964, art. 41, III.",
        sourceUrl: OFFICIAL_SOURCES.constitution,
        tags: ["créditos adicionais", "extraordinário"],
      }),
      card({
        id: "afo_012",
        topicId: "topic_creditos",
        question:
          "Assinale a correspondência correta entre a espécie de crédito adicional e sua finalidade.",
        alternatives: [
          "Suplementar: atender despesa sem dotação específica.",
          "Especial: reforçar dotação já existente.",
          "Extraordinário: atender qualquer despesa não prevista, ainda que comum e adiável.",
          "Suplementar: reforçar dotação orçamentária insuficiente.",
          "Especial: atender exclusivamente despesas urgentes e imprevisíveis.",
        ],
        correctAnswer: "D",
        explanation:
          "A classificação pode ser resolvida por três verbos: suplementar reforça; especial cria dotação específica ausente; extraordinário socorre situação urgente e imprevisível. A insuficiência de uma dotação já existente conduz ao suplementar, enquanto a inexistência de dotação conduz ao especial.",
        alternativeExplanations: [
          "Errada. A ausência de dotação específica caracteriza a necessidade de crédito especial.",
          "Errada. Reforço de dotação existente é a finalidade do crédito suplementar.",
          "Errada. O extraordinário exige urgência e imprevisibilidade, não bastando a ausência de previsão.",
          "Correta. O crédito suplementar aumenta uma dotação existente que se revelou insuficiente.",
          "Errada. Urgência e imprevisibilidade definem o crédito extraordinário, e não o especial.",
        ],
        legalBasis: [
          {
            reference: "Lei nº 4.320/1964, art. 41",
            excerpt:
              "Suplementares, os destinados a reforço de dotação orçamentária; especiais, os destinados a despesas para as quais não haja dotação.",
          },
        ],
        memoryAid: {
          type: "Mapa mental",
          title: "SER dos créditos adicionais",
          content:
            "S = Suplementar → reforça. E = Especial → dotação não existe. R = extraordinário → risco urgente e imprevisível.",
        },
        source: "Lei nº 4.320/1964, art. 41.",
        sourceUrl: OFFICIAL_SOURCES.law4320,
        tags: ["créditos adicionais", "classificação"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_013",
        topicId: "topic_creditos",
        question:
          "Sobre a vigência de créditos especiais e extraordinários, assinale a alternativa correta.",
        alternatives: [
          "Todos podem ser reabertos no exercício seguinte, independentemente da data de autorização.",
          "Somente créditos suplementares podem ser reabertos.",
          "Os autorizados nos últimos quatro meses do exercício podem ser reabertos no exercício seguinte, nos limites dos saldos.",
          "A reabertura exige que o crédito tenha sido integralmente utilizado.",
          "A reabertura transfere automaticamente o saldo por quatro exercícios.",
        ],
        correctAnswer: "C",
        explanation:
          "Créditos especiais e extraordinários autorizados nos últimos quatro meses do exercício podem ter seus saldos reabertos no exercício seguinte e incorporados ao orçamento. É exceção ao princípio da anualidade. Créditos suplementares não recebem essa possibilidade constitucional.",
        alternativeExplanations: [
          "Errada. A autorização precisa ocorrer nos últimos quatro meses, e a reabertura fica limitada ao saldo não utilizado.",
          "Errada. A Constituição menciona especiais e extraordinários; suplementares vigoram dentro do exercício em que são abertos.",
          "Correta. A alternativa reproduz os requisitos temporal, material e quantitativo do art. 167, § 2º.",
          "Errada. Só faz sentido reabrir a parcela não utilizada; utilização integral significa inexistência de saldo.",
          "Errada. A Constituição permite incorporação ao orçamento do exercício seguinte, não prorrogação automática por quatro anos.",
        ],
        legalBasis: [
          {
            reference: "Constituição Federal, art. 167, § 2º",
            excerpt:
              "Os créditos especiais e extraordinários terão vigência no exercício financeiro em que forem autorizados.",
          },
        ],
        memoryAid: {
          type: "Mnemônico",
          title: "EE + 4 → próximo",
          content:
            "Especiais e Extraordinários, autorizados nos últimos 4 meses, podem ir para o próximo exercício pelo saldo.",
        },
        source: "Constituição Federal, art. 167, § 2º.",
        sourceUrl: OFFICIAL_SOURCES.constitution,
        tags: ["créditos adicionais", "vigência", "anualidade"],
        difficulty: "Avançado",
      }),
      card({
        id: "afo_014",
        topicId: "topic_lrf",
        question:
          "Segundo a Lei de Responsabilidade Fiscal, a responsabilidade na gestão fiscal pressupõe:",
        alternatives: [
          "Ação planejada e transparente, prevenção de riscos e correção de desvios capazes de afetar o equilíbrio das contas públicas.",
          "Sigilo dos resultados fiscais até o encerramento do mandato.",
          "Equilíbrio restrito às despesas de capital.",
          "Renúncia de receita sem estimativa de impacto quando autorizada na LOA.",
          "Liberdade para ultrapassar limites fiscais em qualquer situação de interesse público.",
        ],
        correctAnswer: "A",
        explanation:
          "O art. 1º, § 1º, apresenta a síntese conceitual da LRF: planejamento, transparência, prevenção de riscos, correção de desvios, metas de resultados e respeito a limites e condições. É uma questão clássica de literalidade, mas compreender os pares “planejar/prevenir” e “monitorar/corrigir” ajuda a resolver variações.",
        alternativeExplanations: [
          "Correta. A alternativa reproduz os elementos centrais da definição legal de gestão fiscal responsável.",
          "Errada. A transparência é pressuposto expresso, e os relatórios fiscais devem ser divulgados periodicamente.",
          "Errada. O equilíbrio das contas públicas é amplo e não se limita ao grupo das despesas de capital.",
          "Errada. A renúncia de receita se submete a estimativa de impacto e a uma das condições do art. 14 da LRF.",
          "Errada. Limites e condições são pilares da responsabilidade fiscal; exceções dependem de previsão legal específica.",
        ],
        legalBasis: [
          {
            reference: "Lei Complementar nº 101/2000, art. 1º, § 1º",
            excerpt:
              "A responsabilidade na gestão fiscal pressupõe a ação planejada e transparente, em que se previnem riscos e corrigem desvios.",
          },
        ],
        memoryAid: {
          type: "Esquema",
          title: "Planejar → prevenir → medir → corrigir",
          content:
            "Gestão responsável começa planejada e transparente; previne riscos, acompanha metas e corrige desvios antes que o equilíbrio fiscal seja perdido.",
        },
        source: "Lei Complementar nº 101/2000, art. 1º, § 1º.",
        sourceUrl: OFFICIAL_SOURCES.lrf,
        tags: ["LRF", "responsabilidade fiscal"],
        difficulty: "Básico",
      }),
      card({
        id: "afo_015",
        topicId: "topic_lrf",
        question:
          "Constitui mecanismo legal de transparência durante a elaboração e discussão dos instrumentos de planejamento e orçamento:",
        alternatives: [
          "Incentivo à participação popular e realização de audiências públicas.",
          "Divulgação apenas após a aprovação definitiva da LOA.",
          "Restrição do acesso aos relatórios fiscais aos órgãos de controle.",
          "Substituição das audiências públicas por comunicação reservada aos Poderes.",
          "Dispensa de participação popular quando houver publicação em diário oficial.",
        ],
        correctAnswer: "A",
        explanation:
          "A LRF exige incentivo à participação popular e audiências públicas durante a elaboração e discussão dos planos, da LDO e dos orçamentos. Publicar o resultado final não substitui a participação no processo decisório. Transparência fiscal combina publicidade, compreensão e participação social.",
        alternativeExplanations: [
          "Correta. O art. 48, § 1º, I, prevê expressamente os dois mecanismos ao longo do processo de elaboração e discussão.",
          "Errada. A transparência não começa depois da aprovação; ela deve existir durante a formação das escolhas orçamentárias.",
          "Errada. Relatórios e instrumentos fiscais devem ter ampla divulgação, inclusive por meios eletrônicos de acesso público.",
          "Errada. Comunicação interna entre Poderes não substitui a abertura do processo à sociedade.",
          "Errada. Publicidade oficial e participação popular são mecanismos complementares, não alternativas excludentes.",
        ],
        legalBasis: [
          {
            reference: "Lei Complementar nº 101/2000, art. 48, § 1º, I",
            excerpt:
              "Incentivo à participação popular e realização de audiências públicas, durante os processos de elaboração e discussão.",
          },
        ],
        memoryAid: {
          type: "Mapa mental",
          title: "Transparência em três P",
          content:
            "Publicidade dos dados + Participação popular + Processo aberto. Audiência ocorre durante a elaboração, não apenas depois da aprovação.",
        },
        source: "Lei Complementar nº 101/2000, art. 48, § 1º, I.",
        sourceUrl: OFFICIAL_SOURCES.lrf,
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
