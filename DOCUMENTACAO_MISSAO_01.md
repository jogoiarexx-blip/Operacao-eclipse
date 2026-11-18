# Missão 01 — Cinzas na Estrada · Build 0.6.0

## Objetivo narrativo
Resgatar o operador de rádio do comboio aliado destruído e alcançar o posto avançado Nébula.

## Etapas
1. Avançar pela estrada até a área do comboio.
2. Sobreviver à primeira emboscada: dois Errantes de combate próximo e um Soldado Corrompido armado com fuzil.
3. Localizar e resgatar o operador no abrigo improvisado.
4. Escoltar o operador até a aproximação do posto.
5. Defender o posto contra um Soldado Corrompido armado, um Errante e um Rastejador.
6. Atravessar o portão aberto e concluir a missão.

## Soldado Corrompido — comportamento
- Modelo humanoide procedural 3D com capacete, uniforme deteriorado e fuzil visível.
- Mantém uma distância de combate de aproximadamente 8 a 19 metros quando consegue ver Raul.
- Prepara a mira antes de atirar; o aviso na tela permite esquiva ou busca de cobertura.
- Usa traçantes e clarão de disparo. Os tiros são bloqueados por obstáculos registrados no cenário.
- Dano e precisão variam com a dificuldade selecionada.
- Carregador de 5 disparos e reserva de 20; a recarga cria uma janela para o jogador avançar.
- Quando sua vida cai abaixo de 55%, procura uma posição atrás de obstáculos cadastrados como cobertura, se houver uma rota viável.
- Mantido em 3D à distância para preservar a silhueta e a leitura do fuzil.

## Sistemas cobertos pelos testes automatizados
- Menu, briefing, opções e estado de campanha.
- Duas armas do jogador com munições independentes, disparo e recarga.
- Soldado Corrompido armado: modelo/arma, preparação de mira, disparo, traçante, dano, esquiva e recarga.
- Granadas, golpe corpo a corpo, lanterna e HUD.
- Grade de navegação e busca A* para desvio de obstáculos.
- Percepção simplificada por visão e eventos sonoros.
- Escolta com rota, checkpoints e compatibilidade com saves legados.
- Defesa final, abertura do portão e tela de conclusão.

## Validação visual manual pendente
- Confirmar alinhamento visual das mãos com o fuzil em diferentes ângulos.
- Conferir leitura do aviso de mira e do clarão de disparo em 16:9 e 16:10.
- Verificar se o soldado realmente se posiciona atrás de caminhões/barricadas no navegador real.
- Testar se os tiros são bloqueados por cada tipo de cobertura.
- Avaliar equilíbrio de dano e precisão nas quatro dificuldades.
- Medir desempenho WebGL em hardware de entrada.

## Limitações
A navegação é uma grade 2D, não uma navmesh completa. A percepção e a seleção de cobertura usam a lista de objetos registrados como cobertura; objetos decorativos não registrados podem não bloquear visão nem servir de abrigo. O fuzil e as animações do soldado são procedurais e ainda não substituem um modelo rigado com animação esquelética.
