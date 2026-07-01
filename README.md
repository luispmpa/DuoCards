# DuoCards

Uma aplicação de estudo para concursos públicos inspirada na fluidez do
Duolingo, mas construída em torno de questões comentadas e repetição espaçada
com **FSRS real**.

O conteúdo inicial cobre Administração Financeira e Orçamentária (AFO). A
aplicação permite criar, editar, pausar e remover matérias, assuntos e cards.

## O que já funciona

- painel responsivo com meta diária, sequência, XP e progresso por assunto;
- sessão de estudo com questões de múltipla escolha e certo/errado;
- feedback imediato, explicação comentada, fonte e análise de distratores;
- quatro avaliações de memória — De novo, Difícil, Bom e Fácil;
- agendamento por [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs),
  sem algoritmo aproximado;
- CRUD completo de matérias, assuntos e cards;
- gerador gratuito com 24 questões editoriais adicionais de AFO, filtros por
  assunto, formato e dificuldade;
- histórico, precisão, cards maduros e visão dos últimos sete dias;
- persistência local imediata e backup JSON;
- sincronização opcional com Firebase Authentication + Firestore;
- deploy automático e gratuito pelo GitHub Pages.

## Por que este formato de questão

O card é a menor unidade de decisão. Cada card guarda:

1. um comando autossuficiente;
2. alternativas plausíveis ou um item de certo/errado;
3. um gabarito objetivo;
4. uma explicação que enuncia a regra e a aplica ao caso;
5. notas dos distratores mais prováveis;
6. uma fonte normativa ou bibliográfica;
7. o estado completo do FSRS e seu histórico de revisões.

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
7. em produção, cadastre as mesmas chaves em **Settings > Secrets and
   variables > Actions > Variables** do repositório;
8. adicione o domínio `luispmpa.github.io` aos domínios autorizados do
   Firebase Authentication.

As chaves de configuração do SDK Web identificam o projeto; a autorização dos
dados é feita pelas regras do Firestore. As regras incluídas isolam todos os
documentos pelo `uid` autenticado.

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
  lib/storage.ts     persistência local e backup
  App.tsx            fluxos e componentes da aplicação
  styles.css         design system responsivo
```

## Licença

MIT.
