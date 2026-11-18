# Adendo ao GDD — Operação Eclipse v0.8.0

Este adendo complementa o GDD de referência sem substituir a história, os pilares de design ou a campanha planejada.

## Problema observado no protótipo anterior
A Missão 01 estava concentrada em uma estrada estreita e oferecia uma sequência curta de emboscada, resgate e defesa. A densidade de efeitos e objetos não correspondia à variedade de gameplay disponível.

## Direção revisada
Manter uma missão semi-linear de FPS de ação, ampliando o espaço de combate e distribuindo objetivos entre áreas conectadas. Não transformar o nível em mundo aberto.

## Estrutura de gameplay
1. Combate no comboio destruído.
2. Sabotagem de dois repetidores Janus protegidos.
3. Resgate do operador na fazenda em ruínas.
4. Escolta com emboscada no caminho.
5. Defesa do posto em duas ondas.
6. Ativação do rádio e extração.

## Critérios de aceite da Missão 01
- O jogador identifica o objetivo atual sem depender apenas do mapa.
- Os repetidores são claramente identificáveis e só podem ser desativados após neutralizar os defensores próximos.
- As rotas laterais são navegáveis e oferecem coberturas reais.
- O operador consegue acompanhar o jogador e chegar ao posto.
- A defesa tem duas ondas distintas e checkpoint entre elas.
- O portão bloqueia a saída até a transmissão ser ativada.
- Presets Baixo e Equilibrado mantêm densidade reduzida e sombras desativadas.
- Smoke test passa e a validação WebGL é feita em navegadores reais antes do lançamento.
