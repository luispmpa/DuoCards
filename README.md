# DuoCards

Uma aplicação de estudo para concursos públicos inspirada na fluidez do
Duolingo, mas construída em torno de questões comentadas e repetição espaçada
com **FSRS real**.

O conteúdo inicial cobre Administração Financeira e Orçamentária (AFO). A
aplicação permite criar, editar, pausar e remover matérias, assuntos e cards.

## O que já funciona

- painel responsivo com meta diária, sequência, XP e progresso por assunto;
- sessão de estudo com questões objetivas;
- feedback imediato, explicação comentada, fonte e análise de distratores;
- quatro avaliações de memória — De novo, Difícil, Bom e Fácil;
- agendamento por [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs),
  sem algoritmo aproximado;
- CRUD completo de matérias, assuntos e cards;
- geração expansível de questões com Gemini, saída estruturada, fontes oficiais,
  validação local e aprovação editorial antes do FSRS;
- banco inicial revisado com 15 questões A–E completas de AFO;
- histórico, precisão, cards maduros e visão dos últimos sete dias;
- persistência local imediata e backup JSON;
- sincronização opcional com Firebase Authentication + Firestore;
- deploy automático e gratuito pelo GitHub Pages.

## Por que este formato de questão

O card é a menor unidade de decisão. Cada card guarda:

1. um comando autossuficiente;
2. cinco alternativas plausíveis, identificadas de A a E;
3. um gabarito objetivo;
4. uma explicação geral que enuncia a regra e a aplica ao caso;
5. análise individual da alternativa correta e dos quatro distratores;
6. letra da lei e link para a fonte oficial;
7. esquema, mapa mental, quadro comparativo ou mnemônico confiável;
8. o estado completo do FSRS e seu histórico de revisões.

Isso separa duas medidas diferentes: **acerto da questão** e **esforço para
lembrar**. O acerto alimenta as métricas; a avaliação de memória alimenta o
FSRS. Misturar os dois sinais empobreceria o agendamento.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Validação:

```bash
npm test
npm run build
```

## Armazenamento local e Firebase opcional

Sem Firebase, o app continua totalmente utilizável e mantém os dados somente
no armazenamento do navegador atual. Nesse modo não existe conta nem
sincronização: limpar os dados do site ou trocar de navegador/dispositivo exige
restaurar um backup JSON.

Para sincronizar automaticamente entre dispositivos:

1. crie um projeto no
   [Firebase Console](https://console.firebase.google.com/);
2. adicione um aplicativo Web;
3. ative **Authentication > Google**;
4. crie um banco **Cloud Firestore**;
5. publique as regras de [`firestore.rules`](./firestore.rules);
6. copie `.env.example` para `.env.local` e preencha as variáveis;
7. defina `VITE_FIREBASE_CLOUD_SYNC_ENABLED=true`;
8. em produção, disponibilize as mesmas variáveis no workflow do repositório;
9. adicione o domínio `luispmpa.github.io` aos domínios autorizados do
   Firebase Authentication.

As chaves de configuração do SDK Web identificam o projeto; a autorização dos
dados é feita pelas regras do Firestore. As regras incluídas isolam todos os
documentos pelo `uid` autenticado.

## Geração com Gemini sem expor credenciais

O app usa o **Firebase AI Logic** com o Gemini Developer API. A chamada parte
do navegador, mas passa pelo proxy do Firebase; a chave do Gemini não é
incluída no repositório nem no JavaScript publicado. O App Check reduz o uso
por clientes não autorizados.

Configuração:

1. no projeto Firebase, abra **AI Logic**, clique em **Get started** e escolha
   **Gemini Developer API** no plano gratuito;
2. em **App Check**, registre a aplicação Web com **reCAPTCHA Enterprise** para
   o domínio `luispmpa.github.io`;
3. copie a chave pública do site para
   `VITE_FIREBASE_APPCHECK_SITE_KEY`;
4. disponibilize essa variável ao build do GitHub Pages;
5. depois de verificar uma chamada em produção, ative a aplicação obrigatória do App Check
   para **Firebase AI Logic**.

O modelo padrão é `gemini-3.5-flash`. Ele pode ser trocado sem alterar código
por meio de `VITE_GEMINI_MODEL`. A geração é gratuita dentro das cotas do
Gemini Developer API; o app limita cada lote a cinco questões para preservar a
profundidade das explicações e dar uma
revisão humana confortável, mas não limita o total do banco.

Toda resposta passa por um esquema JSON e por validações locais: assunto,
formato A–E, análise das cinco alternativas, gabarito, duplicidade, letra da
lei, recurso de memorização e domínio oficial da fonte. Mesmo assim, a
interface exige revisão antes de inserir as questões no FSRS.

## GitHub Pages

O workflow em `.github/workflows/deploy-pages.yml` testa, compila e publica o
site. Em **Settings > Pages**, selecione **GitHub Actions** como origem.

URL esperada:

`https://luispmpa.github.io/DuoCards/`

## Estrutura

```text
src/
  data/seed.ts       conteúdo inicial de AFO
  lib/fsrs.ts        adaptador e serialização do ts-fsrs
  lib/firebase.ts    autenticação e sincronização opcional
  lib/gemini.ts      geração estruturada e validação das questões
  lib/storage.ts     persistência local e backup
  App.tsx            fluxos e componentes da aplicação
  styles.css         design system responsivo
```

## Licença

MIT.
