# Catálogo de trilhas de estudo do VestibulAnki

Documento escrito pela equipe. Cada trilha tem um critério objetivo de quando ser recomendada.
O assistente não inventa trilhas: as regras abaixo são aplicadas em código (`perfil.py`) sobre os
dados do aluno, e o assistente explica a trilha indicada citando o dado que a disparou.
Quando mais de uma trilha se aplica, vale a ordem de prioridade (P1 é a mais importante).

## [TRI-1] Trilha Resgate Urgente (prioridade P1)

Quando recomendar: 5 ou mais cards na fila Urgente, ou 10 ou mais cards vencidos.
Plano: durante 3 a 5 dias, fazer sessões curtas (10 a 15 cards) só com os cards vencidos,
começando pela fila Urgente, até a fila Urgente ficar com menos de 5 cards.
Antes de responder cada card urgente, reler o verso da última vez em que errou.
Objetivo: parar a "bola de neve" de revisões atrasadas.

## [TRI-2] Trilha Ritmo Diário (prioridade P2)

Quando recomendar: menos de 3 sessões nos últimos 7 dias.
Plano: escolher um horário fixo e fazer pelo menos 1 sessão por dia com no mínimo 10 cards,
subindo até a meta diária de 20 cards. Não pular dois dias seguidos.
Objetivo: criar constância, que é o que faz a repetição espaçada funcionar.

## [TRI-3] Trilha Reforço por Matéria (prioridade P3)

Quando recomendar: um baralho com 5 ou mais cards estudados e ICE médio abaixo de 60.
Plano: fazer 2 sessões focadas só nesse baralho por semana; nos cards com menor ICE,
anotar com as próprias palavras o porquê da resposta antes de virar o card;
depois de uma semana, conferir se o ICE médio do baralho subiu.
Objetivo: fechar lacunas concentradas em uma matéria.

## [TRI-4] Trilha Primeiros Passos (prioridade P4)

Quando recomendar: um baralho em que menos de 30% dos cards já foram estudados.
Plano: incluir esse baralho nas sessões diárias com 5 cards novos por dia, sem deixar de revisar
os cards vencidos dos outros baralhos.
Objetivo: começar a cobrir uma matéria que ainda está praticamente intocada.

## [TRI-5] Trilha Calibração da Autoavaliação (prioridade P5)

Quando recomendar: 2 ou mais cards com alerta ("Possível chute" ou "Descuido recorrente").
Plano: nesses cards, antes de marcar a dificuldade, perguntar-se "eu saberia explicar isso para
um colega?". Marcar "Fácil" só quando a resposta veio rápida e com certeza.
Nos cards com descuido recorrente, ler a pergunta duas vezes antes de responder.
Objetivo: tornar a autoavaliação honesta, para que pontos, ICE e filas reflitam o domínio real.

## [TRI-6] Trilha Simulado UFPR (prioridade P6)

Quando recomendar: ICE geral de 70 ou mais e nenhum simulado nos últimos 14 dias.
Plano: fazer um simulado no Modo Vestibular com todas as matérias e 5 questões por matéria,
respeitando o tempo; depois, revisar as questões erradas e comparar a nota por matéria.
Objetivo: treinar a prova em condições reais e a estratégia de deixar em branco (erro vale -0,25).

## [TRI-7] Trilha Manutenção (prioridade P7)

Quando recomendar: ICE geral de 80 ou mais e no máximo 2 cards na fila Urgente.
Plano: manter as revisões diárias dos cards vencidos e criar novos cards (manualmente ou com o
gerador de IA) sobre assuntos que ainda não estão em nenhum baralho.
Objetivo: manter o que já foi consolidado e ampliar o conteúdo.

## [TRI-0] Sem trilha indicada

Se nenhuma regra se aplicar, o assistente deve dizer que nenhuma trilha específica foi disparada
pelos dados e sugerir continuar revisando os cards vencidos diariamente.
