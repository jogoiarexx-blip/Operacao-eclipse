# Missão 01 — Cinzas na Estrada

**Build:** 0.2.0 · **Estado:** fluxo de jogo completo em nível de protótipo · **Base:** GDD Operação Eclipse 1.0.

## Contexto

Apeninos italianos, novembro de 1944. O sargento Raul Azevedo recebe uma transmissão interrompida e parte para investigar o desaparecimento de um comboio aliado. A capitã Elisa Moretti mantém contato pelo rádio. Um operador ferido sobrevive perto de um abrigo de campanha; as criaturas do Vazio estão atraídas pelo sinal.

## Progressão detalhada

| Etapa | Gatilho | Conteúdo | Checkpoint |
|---|---|---|---|
| 0. Aproximação | Nova campanha | Introdução, estrada, movimento, sprint e observação dos destroços | Inicial |
| 1. Emboscada | Jogador cruza o limite do comboio | 3 Errantes, cobertura nos caminhões, tiro e recarga | Não |
| 2. Área segura | Os 3 Errantes morrem | Mensagem de Moretti e objetivo de resgatar operador | Sim |
| 3. Resgate | Jogador usa `E` junto ao operador | Operador levanta, acompanha o jogador e revela informação narrativa | Sim |
| 4. Defesa do posto | Jogador e operador alcançam a aproximação | Aviso de ameaça, 2 Errantes e 1 Rastejador | Não |
| 5. Portão aberto | Todos os inimigos da defesa são derrotados | Portão sobe; jogador entra no posto avançado | Sim |
| Conclusão | Jogador atravessa o portão aberto | Estatísticas, documento encontrado, replay do capítulo desbloqueado | Registro de conclusão |

**Objetivo obrigatório:** resgatar o operador e chegar ao posto avançado. **Objetivo opcional:** encontrar 1 documento Janus na lateral da estrada, próximo às ruínas.

## Mecânicas da missão

- **Arma:** fuzil semiautomático, 8 cartuchos por carregador, 40 de reserva no início; munição extra no cenário.
- **Dano:** tiros na cabeça recebem bônus; impactos contra caminhões, barricadas e paredes são bloqueados.
- **Inimigos:** Errantes atacam corpo a corpo; Rastejador é menor, mais rápido e causa dano em investida curta. Ambos sinalizam o ataque antes de atingir.
- **Representação híbrida:** modelos 3D próximos e sprites 2D distantes; troca com histerese entre 26 m e 32 m. A lógica de vida e dano permanece a mesma.
- **Vida:** 100 pontos; kits restauram até 50 e não são consumidos quando a vida está cheia.
- **Fôlego:** correr consome energia e a recuperação ocorre ao andar ou parar.
- **Operador:** acompanha o jogador depois do resgate; a etapa de defesa só inicia quando ele chega à aproximação do posto.
- **Portão:** bloqueia a passagem até a defesa ser concluída; sobe antes de liberar a extração.
- **Checkpoint:** registra fase, posição, vida, fôlego, munição, itens recolhidos, documento e estatísticas. Repetir um checkpoint não consome permanentemente os recursos gastos depois dele.

## Narrativa de rádio

A capitã Moretti orienta a aproximação, avisa sobre a primeira emboscada, confirma a área segura e coordena a abertura do posto. O operador menciona criaturas vindas da encosta e interferência no rádio. O documento opcional introduz a conexão com o Projeto Janus.

## Interface e feedback

- HUD: objetivo atual, distância até o próximo ponto, vida, fôlego, munição, bússola, estado do operador e documento.
- Mapa tático temporário com `Tab`, sem pausar o combate.
- Aviso de checkpoint, mensagens de rádio, tutorial, hit marker e flash de dano.
- Telas: menu, briefing, pausa, derrota e conclusão com eliminações, precisão, vida, tempo e documento.

## Critérios de aceite e validação

- [x] O fluxo lógico das etapas 0–5 foi implementado.
- [x] Resgate e extração não podem ser concluídos fora de ordem.
- [x] O portão fechado bloqueia a passagem.
- [x] O save/checkpoint restaura o estado da missão.
- [x] O menu e os arquivos usam caminhos relativos para GitHub Pages.
- [x] O smoke test de lógica executa as etapas e confirma conclusão.
- [ ] Validar gameplay visual e Pointer Lock em navegador real.
- [ ] Validar FPS e compatibilidade em máquinas de referência.
- [ ] Substituir arte e animações provisórias por assets definitivos.

**Nota:** a implementação entrega o ciclo completo da missão, mas a direção de arte e o polimento de um jogo comercial ainda não estão finalizados. O documento original da versão 0.1.0 está arquivado em `docs/PLANO_ORIGINAL_0.1.0.md`.
