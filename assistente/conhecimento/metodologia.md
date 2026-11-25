# Guia da metodologia do VestibulAnki

Documento escrito pela equipe a partir da especificação do app (CLAUDE.md do projeto)
e do código-fonte (`useSpacedRepetition.js`, `useStudySession.js`, `Vestibular.jsx`).
É a fonte oficial que o assistente usa para explicar como o app funciona.

## [MET-1] Fluxo de estudo de um card

No modo Estudar o aluno vê a frente do card, clica em "Ver resposta" e o card vira (flip 3D)
mostrando o verso. Em seguida o aluno informa duas coisas: se acertou ou errou, e a
dificuldade que sentiu (Muito difícil, Médio ou Fácil). Com essas duas respostas o app
calcula os pontos do card e decide em qual fila ele entra e quando será revisado de novo.

## [MET-2] Matriz de pontos (anti-chute e anti-descuido)

Acertou e achou muito difícil: +4 pontos (domínio real).
Acertou e achou médio: +3 pontos (acerto consistente).
Acertou e achou fácil: +2 pontos (pode ser chute ou excesso de confiança).
Errou e achou muito difícil: -1 ponto (erro compreensível).
Errou e achou médio: -2 pontos (lacuna moderada).
Errou e achou fácil: -4 pontos (descuido grave).
A pontuação de uma sessão nunca fica negativa: o mínimo é 0.

## [MET-3] ICE — Índice de Confiabilidade do Estudo

O ICE vai de 0 a 100 e mede o quanto o desempenho do aluno é confiável.
Cada card começa com ICE 50 antes de ser estudado. Depois da primeira resposta, o ICE do card
é calculado como (máximo possível + soma dos pontos do histórico) dividido pelo máximo possível,
vezes 100, limitado entre 0 e 100. O máximo possível é 4 pontos por tentativa.
Faixas de interpretação: 80 a 100 é Excelente; 60 a 79 é Bom; 40 a 59 é Regular;
0 a 39 é "Precisa estudar mais".
Um ICE baixo indica erros frequentes, principalmente erros em cards que o aluno achou fáceis.

## [MET-4] Filas de repetição espaçada e intervalos

Errou e achou fácil: fila Urgente, revisão em 1 dia.
Errou e achou médio: fila Urgente, revisão em 2 dias.
Errou e achou difícil: fila Em breve, revisão em 3 dias.
Acertou e achou difícil: fila Em breve, revisão em 5 dias.
Acertou e achou médio: fila Em breve, revisão em 7 dias.
Acertou e achou fácil: fila Consolidado, revisão em 14 dias.
Cards novos, ainda não estudados, começam na fila Em breve.

## [MET-5] Ordem das revisões e cards vencidos

Um card está "vencido" quando a data de próxima revisão já passou. A sessão de estudo mostra
apenas cards vencidos e os ordena por prioridade: primeiro a fila Urgente, depois Em breve,
depois Consolidado. Por isso, acumular cards urgentes atrasa a revisão dos outros.

## [MET-6] Alertas automáticos por card

"Possível chute": o card tem 3 ou mais tentativas, taxa de acerto de 80% ou mais e o aluno
marcou "Muito difícil" em todos os acertos. Indica que o aluno acerta mas não confia no que sabe,
ou que pode estar acertando por eliminação.
"Descuido recorrente": o card tem 2 ou mais erros marcados como "Fácil". Indica que o aluno
acha que sabe o conteúdo, mas erra por falta de atenção ou por confiança excessiva.

## [MET-7] Modo Vestibular e pontuação UFPR

O simulado usa apenas cards de múltipla escolha dos baralhos escolhidos. O aluno define
quantas questões por matéria e o tempo total (padrão de 5 horas).
Pontuação no estilo UFPR: acerto vale +1,00; erro vale -0,25; questão em branco vale 0.
A nota nunca fica negativa. Por causa do desconto de 0,25, chutar sem nenhuma eliminação de
alternativas tende a não compensar; deixar em branco é melhor quando o aluno não tem ideia.
A nota de corte exibida no resultado é um valor fictício de referência, não um dado oficial.

## [MET-8] Constância, sequência e meta diária

A sequência (streak) conta quantos dias seguidos o aluno fez pelo menos uma sessão de estudo,
contando a partir de hoje (ou de ontem, se ainda não estudou hoje).
A meta diária padrão é de 20 cards revisados por dia.
Estudar um pouco todo dia funciona melhor do que estudar muito em um dia só, porque a
repetição espaçada depende de revisar cada card na data certa.

## [MET-9] Limites do assistente

O assistente só conhece os dados de estudo do próprio aluno (baralhos, cards, sessões e
simulados) e este guia. Ele não sabe datas de provas, notas de corte reais, conteúdo de editais
nem resolve exercícios. Ele não garante aprovação. Para dúvidas sobre o conteúdo de um card,
o aluno deve consultar o verso do card ou o material da matéria.
