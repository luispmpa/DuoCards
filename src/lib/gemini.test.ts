import { describe, expect, it } from "vitest";
import { createSeedData } from "../data/seed";
import {
  validateGeminiPayload,
  type GeminiPayload,
  type GeminiQuestionDraft,
} from "./gemini";

function draft(
  partial: Partial<GeminiQuestionDraft> = {},
): GeminiQuestionDraft {
  return {
    topicId: "topic_principios",
    kind: "multiple_choice",
    question:
      "Segundo a Lei nº 4.320/1964, qual afirmação expressa corretamente o princípio do orçamento bruto?",
    alternatives: [
      "Receitas e despesas constam pelos seus totais, vedadas deduções.",
      "Somente as receitas tributárias devem constar pelo valor bruto.",
      "As despesas podem ser apresentadas líquidas das receitas vinculadas.",
      "A regra alcança apenas o orçamento de investimento das estatais.",
      "O registro pelos valores totais é facultativo quando houver receita intraorçamentária.",
    ],
    correctAlternativeIndex: 0,
    explanation:
      "O princípio do orçamento bruto determina que receitas e despesas sejam registradas pelos respectivos valores totais. A apresentação líquida esconderia o volume real dos fluxos orçamentários e contrariaria a Lei nº 4.320/1964.",
    alternativeAnalyses: [
      {
        alternativeIndex: 0,
        explanation:
          "Correta. O art. 6º da Lei nº 4.320/1964 determina que todas as receitas e despesas constem pelos seus totais, sem deduções, revelando integralmente os fluxos orçamentários.",
      },
      {
        alternativeIndex: 1,
        explanation:
          "Errada. A regra não se limita às receitas tributárias: ela alcança todas as receitas e despesas do orçamento, conforme a redação abrangente do art. 6º da Lei nº 4.320/1964.",
      },
      {
        alternativeIndex: 2,
        explanation:
          "Errada. A apresentação líquida é justamente o comportamento vedado pelo orçamento bruto, porque ocultaria parte das entradas e saídas previstas na lei orçamentária.",
      },
      {
        alternativeIndex: 3,
        explanation:
          "Errada. O princípio do orçamento bruto é geral e não se restringe ao orçamento de investimento das empresas estatais controladas pelo poder público.",
      },
      {
        alternativeIndex: 4,
        explanation:
          "Errada. A Lei nº 4.320/1964 não torna facultativo o registro bruto nessa hipótese; receitas e despesas devem aparecer pelos seus valores totais.",
      },
    ],
    legalBasis: [
      {
        reference: "Lei nº 4.320/1964, art. 6º",
        excerpt:
          "Todas as receitas e despesas constarão da Lei de Orçamento pelos seus totais, vedadas quaisquer deduções.",
      },
    ],
    memoryAid: {
      type: "Esquema",
      title: "Bruto = sem descontos",
      content:
        "ORÇAMENTO BRUTO → registrar entrada total + saída total → nunca compensar nem apresentar apenas o valor líquido.",
    },
    source: "Lei nº 4.320/1964, art. 6º.",
    sourceUrl: "https://www.planalto.gov.br/ccivil_03/leis/l4320.htm",
    tags: ["princípios", "orçamento bruto"],
    difficulty: "Intermediário",
    ...partial,
  };
}

describe("Gemini question validation", () => {
  it("converts a valid generated question into a fresh FSRS card", () => {
    const data = { ...createSeedData(), cards: [] };
    const payload: GeminiPayload = { questions: [draft()] };
    const result = validateGeminiPayload(payload, data, data.topics);

    expect(result.cards).toHaveLength(1);
    expect(result.rejected).toBe(0);
    expect(result.cards[0].correctAnswer).toBe("A");
    expect(result.cards[0].sourceUrl).toContain("planalto.gov.br");
    expect(result.cards[0].schedule.reps).toBe(0);
    expect(result.cards[0].tags).toContain("gerada com Gemini");
    expect(Object.keys(result.cards[0].alternativeExplanations ?? {})).toHaveLength(
      5,
    );
    expect(result.cards[0].memoryAid?.type).toBe("Esquema");
    expect(result.cards[0].legalBasis?.[0].excerpt).toContain(
      "pelos seus totais",
    );
  });

  it("rejects duplicate questions and non-official source URLs", () => {
    const data = createSeedData();
    const existingQuestion = data.cards[0].question;
    const payload: GeminiPayload = {
      questions: [
        draft({ question: existingQuestion }),
        draft({
          question:
            "Qual regra orçamentária é aplicável a este exemplo hipotético apresentado para fins de teste?",
          sourceUrl: "https://example.com/fonte",
        }),
      ],
    };
    const result = validateGeminiPayload(payload, data, data.topics);

    expect(result.cards).toHaveLength(0);
    expect(result.rejected).toBe(2);
  });

  it("requires exactly five alternatives and five analyses", () => {
    const data = createSeedData();
    const payload: GeminiPayload = {
      questions: [
        draft({
          alternatives: ["A", "B", "C", "D"],
          alternativeAnalyses: [],
          correctAlternativeIndex: 0,
        }),
      ],
    };
    const result = validateGeminiPayload(payload, data, data.topics);

    expect(result.cards).toHaveLength(0);
    expect(result.rejected).toBe(1);
  });
});
