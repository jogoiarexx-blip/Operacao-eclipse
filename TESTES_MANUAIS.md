# Roteiro de testes manuais — Build 0.6.0

Executar em Chrome, Edge ou Firefox com WebGL e conexão à internet. O smoke test automatizado não usa GPU.

## Menu e configurações
- [ ] Menu e briefing aparecem sem erros no console.
- [ ] Volume, sensibilidade, FOV, qualidade, dificuldade, inversão vertical e redução de movimento persistem após atualizar.
- [ ] Baixo/Equilibrado/Alto alteram densidade e resolução sem travamentos.
- [ ] F3 mostra draw calls, triângulos, IA ativa e preset.
- [ ] Esc pausa e retoma sem perder o controle do mouse.

## Combate do jogador
- [ ] Fuzil e pistola têm munições e recargas independentes.
- [ ] Mira abre/fecha a dispersão e reduz a sensibilidade.
- [ ] Granada, corpo a corpo, lanterna, dano e indicadores continuam funcionando.

## Soldado Corrompido armado
- [ ] Fuzil aparece nas mãos do inimigo e acompanha a rotação do corpo.
- [ ] O soldado aparece na primeira emboscada e na defesa do posto.
- [ ] O aviso "SOLDADO CORROMPIDO MIRANDO" aparece antes do disparo.
- [ ] É possível sair da linha de tiro durante a preparação e evitar o dano.
- [ ] O clarão do cano e o traçante ficam visíveis ao disparar.
- [ ] Caminhões, muros e barricadas bloqueiam o tiro quando estão na linha entre soldado e jogador.
- [ ] O soldado dispara cinco tiros, inicia recarga e volta a disparar depois dela.
- [ ] Ao perder vida, tenta procurar cobertura em obstáculos cadastrados, quando houver posição alcançável.
- [ ] Precisão e dano variam entre Recruta, Soldado, Veterano e Pesadelo.
- [ ] O soldado permanece 3D a longa distância para não perder a representação da arma.

## Criaturas e percepção
- [ ] Errantes contornam veículos e barricadas em vez de atravessar colisores.
- [ ] Rastejador telegrava e executa investida; o jogador consegue esquivar.
- [ ] Tiros atraem inimigos próximos mesmo sem linha de visão direta.
- [ ] Caminhada gera ruído moderado, corrida gera ruído alto e agachar reduz ruído.
- [ ] Ao perder visão e ruído, o inimigo procura a última posição conhecida.
- [ ] Inimigos caem gradualmente ao morrer.

## Operador e missão
- [ ] Operador navega em volta de caixas, caminhões e ruínas durante a escolta.
- [ ] Sequência: emboscada → resgate → escolta → defesa → portão → extração.
- [ ] Checkpoints preservam arma, munição, granadas, documento e fase.
- [ ] Checkpoint da emboscada recria dois Errantes e um Soldado Corrompido.
- [ ] Checkpoint da defesa recria um Soldado Corrompido, um Errante e um Rastejador.
- [ ] Saves das versões 0.2–0.5 continuam carregando com valores padrão para campos novos.

## Performance e publicação
- [ ] Testar 5 reinícios de missão e observar memória/erros no console.
- [ ] Testar Baixo e Equilibrado durante a defesa final.
- [ ] Verificar se a navegação não causa pausas visíveis ao procurar cobertura.
- [ ] Publicar no GitHub Pages e verificar caminhos relativos `./src/...`.
- [ ] Testar com janela 16:9, 16:10 e resolução 1366×768.

## Limites conhecidos
A grade de navegação é 2D e usa colisores circulares. A seleção de cobertura só considera objetos cadastrados como obstáculos. O smoke test usa um simulador mínimo de Three.js/DOM e não substitui o teste visual em navegador real com WebGL.
