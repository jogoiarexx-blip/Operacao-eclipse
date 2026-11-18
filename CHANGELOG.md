# Changelog — Operação Eclipse

## v0.7.0 — Animação, materiais, explosões e áudio

- Rigs esqueléticos procedurais com ossos nomeados para pelvis, coluna, pescoço, cabeça, ombros, cotovelos, punhos, quadris e joelhos.
- Animações ósseas de caminhada, corrida/avanço, preparação de ataque, mira, recarga, reação a impacto e queda/morte para inimigos; operador de rádio usa rig de escolta.
- Mãos de primeira pessoa com mangas, punhos, palma e dedos segmentados; fuzil e pistola receberam detalhes de acabamento, ferrolho, alça, guarda-mato, bandoleira e ranhuras.
- Explosões com sprites volumétricos em camadas, esfera de energia, anel de choque e luz pontual dinâmica; respeitam preset gráfico.
- Iluminação cinematográfica com preenchimento frio, luzes quentes de incêndio, feixes atmosféricos baratos e oscilação de fogo.
- Materiais procedurais de pintura militar, metal oxidado, madeira, lona, pedra, reboco, areia e borracha, com mapas de cor/roughness/bump gerados em canvas.
- Paisagem sonora WebAudio com vento contínuo, rumble grave, interferência Janus, artilharia distante aleatória, estática de rádio, disparos espacializados e explosão em camadas. Sem arquivos de áudio externos.
- Mantida a compatibilidade dos saves e o deploy estático do GitHub Pages.

### Validação
- `node --check src/main.js`
- `node tests/smoke.cjs`
- Teste de integração do workflow e integridade do ZIP.
- A renderização real e a qualidade sonora ainda precisam ser conferidas em navegador com WebGL/WebAudio.
