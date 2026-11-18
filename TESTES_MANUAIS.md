# Roteiro de testes manuais — Build 0.5.0

Executar em Chrome, Edge ou Firefox com WebGL e conexão à internet. O smoke test automatizado não usa GPU.

## Menu e configurações
- [ ] Menu e briefing aparecem sem erros no console.
- [ ] Volume, sensibilidade, FOV, qualidade, dificuldade, inversão vertical e redução de movimento persistem após atualizar.
- [ ] Baixo/Equilibrado/Alto alteram densidade e resolução sem travamentos.
- [ ] F3 mostra draw calls, triângulos, IA ativa e preset.
- [ ] Esc pausa e retoma sem perder o controle do mouse.

## Combate e percepção
- [ ] Fuzil e pistola têm munições e recargas independentes.
- [ ] Mira abre/fecha a dispersão da mira e reduz a sensibilidade.
- [ ] A mira dinâmica abre ao disparar/correr e fecha ao estabilizar.
- [ ] Tiros atraem inimigos próximos mesmo sem linha de visão direta.
- [ ] Caminhada gera ruído moderado, corrida gera ruído alto e agachar reduz ruído.
- [ ] Agachar reduz a distância de detecção visual.
- [ ] Ao perder visão e ruído, o inimigo procura a última posição conhecida e depois entra em busca.
- [ ] Errantes contornam veículos e barricadas em vez de atravessar colisores.
- [ ] Rastejador telegrava e executa investida; o jogador consegue esquivar.
- [ ] Inimigos caem gradualmente ao morrer.
- [ ] Granada, corpo a corpo, lanterna, dano e indicadores continuam funcionando.

## Operador e missão
- [ ] Operador navega em volta de caixas, caminhões e ruínas durante a escolta.
- [ ] A sequência da missão continua: emboscada → resgate → escolta → defesa → portão → extração.
- [ ] Checkpoints preservam arma, munição, granadas, documento e fase.
- [ ] Saves das versões 0.2–0.4 continuam carregando com valores padrão para campos novos.

## Performance e publicação
- [ ] Testar 5 reinícios de missão e observar memória/erros no console.
- [ ] Testar Baixo e Equilibrado em combate com seis inimigos.
- [ ] Verificar se a navegação não causa pausas visíveis quando os inimigos recalculam rotas.
- [ ] Publicar no GitHub Pages e verificar caminhos relativos `./src/...`.
- [ ] Testar com janela 16:9, 16:10 e resolução 1366×768.

## Limites conhecidos
A grade de navegação é 2D e usa colisores circulares. Ela é adequada ao percurso da missão 01, mas precisa ser substituída ou complementada por navmesh/waypoints setoriais em fases com vários andares, escadas e interiores complexos.
