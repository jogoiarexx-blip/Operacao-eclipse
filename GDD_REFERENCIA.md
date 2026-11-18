# GDD — OPERAÇÃO ECLIPSE: A GUERRA DOS ESQUECIDOS

**Versão:** 1.0 — proposta de produção  
**Gênero:** FPS de campanha, ação tática, horror sobrenatural e sobrevivência leve  
**Motor:** Three.js (WebGL), JavaScript/TypeScript, navegador  
**Estilo visual:** 3D estilizado de guerra dos anos 1940 + 2D estratégico para reduzir processamento  
**Plataforma principal:** PC (teclado/mouse), hospedagem estática compatível com GitHub Pages  
**Campanha planejada:** 12 missões, cerca de 5–7 horas no primeiro percurso (meta, não promessa)  
**Modos iniciais:** campanha solo, offline após carregamento dos recursos quando possível  
**Classificação pretendida:** ação violenta de fantasia, atmosfera sombria; classificação oficial a definir

---

## 1. Visão geral

**Frase de venda:** *Em 1944, o pior inimigo não está do outro lado da trincheira.*

Em uma região fictícia dos Apeninos italianos, no fim de 1944, uma unidade aliada encontra vilarejos abandonados, transmissões impossíveis e soldados que desapareceram sem deixar rastros. O protagonista, **sargento Raul Azevedo**, combatente brasileiro destacado para a força ficcional **Esquadrão Nébula**, descobre que um programa clandestino chamado **Projeto Janus** rompeu uma barreira entre o mundo humano e o **Vazio**, liberando criaturas atraídas por medo, ruído e energia elétrica.

O jogo usa a linguagem de um FPS de Segunda Guerra Mundial — trincheiras, bunkers, metralhadoras, artilharia, neve e cidades destruídas — mas troca o conflito convencional pelo combate contra monstros. É **ficção alternativa**, sem pretensão de retratar batalhas ou operações reais.

### 1.1 Pilares de design

1. **Armas com peso:** recuo legível, recarga convincente, sons fortes, dano com feedback e munição com importância.
2. **Guerra contra o impossível:** tropas monstruosas com comportamento diferente de soldados humanos.
3. **Campanha com começo, meio e fim:** objetivos claros, revelações, aliados, personagens recorrentes e encerramento.
4. **Tensão e ação equilibradas:** alternância entre exploração, combate, emboscadas e grandes defesas.
5. **Visual convincente e leve:** 3D nas interações importantes; 2D onde a percepção visual permite economizar GPU/CPU.

### 1.2 O que o jogo não é

Não é um mundo aberto integral, não tem multiplayer no lançamento, não usa centenas de inimigos com IA completa ao mesmo tempo e não depende de ray tracing ou física destrutiva global. O combate é intenso porque o diretor de encontros controla ritmo, posições e ameaças, não porque tudo está ativo de uma vez.

## 2. Público e experiência

- Público: fãs de FPS militares, campanhas lineares, monstros, mistério e terror de ação.
- Câmera: primeira pessoa, FOV ajustável (70°–100° como faixa inicial).
- Ritmo: 60% combate, 25% exploração/interação, 15% sequências narrativas (meta flexível).
- Acessibilidade: legendas, remapeamento, sensibilidade, inversão vertical, modo sem tremor forte da câmera, opções de contraste e intensidade de efeitos.
- Dificuldades: **Recruta**, **Soldado**, **Veterano** e **Pesadelo**; variam vida, dano, recursos e agressividade, sem transformar todos os inimigos em esponjas.

## 3. História completa

### Ato I — O sinal sob a terra (missões 1–4)

Em novembro de 1944, a rádio aliada intercepta um pedido de socorro vindo de uma vila evacuada. Raul chega com os especialistas **capitã Elisa Moretti** (comando e comunicação) e **Dr. Tomás Vilar** (cientista e intérprete dos documentos do Janus). A patrulha é atacada por criaturas surgidas da lama. Os aliados descobrem que os monstros seguem o sinal de uma antena de laboratório; interromper o sinal salva a estação ferroviária, mas ativa um transmissor maior na montanha.

**Ponto de virada:** documentos revelam que o Projeto Janus tentou criar um dispositivo para detectar movimentos inimigos através de grandes distâncias. O experimento encontrou uma dimensão hostil, e o sinal virou uma porta.

### Ato II — A máquina que chama (missões 5–8)

A equipe sobe em direção ao complexo. Sobreviventes se refugiam em florestas, hospitais de campanha e túneis. Vilar confessa ter colaborado com o projeto antes de compreender seu risco. A capitã Moretti quer destruir tudo; Vilar acredita que o núcleo deve ser desligado em etapas, ou a explosão ampliará a fenda. No bunker, Raul enfrenta uma criatura blindada gerada em torno do gerador. Recupera então o **Coração de Janus**, chave física para interromper o portal.

**Ponto de virada:** o portal tem um guardião inteligente, o **Arconte**, que usa transmissões de rádio para copiar vozes humanas e atrair tropas.

### Ato III — O último amanhecer (missões 9–12)

As criaturas avançam em direção à cidade e a uma linha de trem de suprimentos. Raul escolta refugiados, interrompe o transporte de componentes Janus e invade a usina. A equipe perde contato com parte dos aliados. No confronto final, Raul posiciona cargas nos três reguladores enquanto Moretti mantém a comunicação e Vilar conduz o desligamento. Vilar permanece na sala do núcleo para completar o procedimento; a barreira é fechada e Raul escapa com Moretti.

**Final canônico:** ao amanhecer, os sinais cessam e as criaturas remanescentes perdem coordenação. A guerra humana continua, mas a fenda foi contida. Cena pós-créditos opcional: um rádio desligado transmite uma única frase — *“Ainda ouvimos vocês.”* O gancho não prejudica o fechamento do jogo principal.

### Narrativa e cenas

- Abertura: animação 2D estilo quadrinhos de guerra com mapas e fotos tratadas; transição para gameplay 3D.
- Cenas curtas durante o jogo: rádio, vozes, personagens 3D próximos e movimentos guiados.
- Cutscenes maiores: ilustrações em camadas 2D, movimento de câmera e narração; economiza modelos e animação facial.
- Documentos colecionáveis: até 24 páginas opcionais, cada uma com história, mas sem bloquear a progressão principal.
- Diálogos nunca podem cobrir alertas essenciais; oferecer modo de avanço de fala.

## 4. Campanha — 12 missões

| Nº | Missão | Cenário | Objetivo principal | Nova mecânica / clímax |
|---|---|---|---|---|
| 01 | **Cinzas na Estrada** | Estrada italiana, comboio destruído | Resgatar um operador de rádio e alcançar o posto avançado | Tutorial de movimento, mira, tiro e primeira emboscada |
| 02 | **A Vila sem Sinos** | Vila abandonada | Investigar seis marcas, religar três pontos de energia e evacuar sobreviventes | Exploração, lanterna, inimigos atraídos por som |
| 03 | **Trincheira dos Ossos** | Trincheiras inundadas | Recuperar documentos e atravessar a linha | Introdução a armadilhas, minichefe **Escavador** |
| 04 | **Último Trem** | Pátio ferroviário | Defender o rádio até chegar a composição de resgate | Defesa por ondas com barricadas e metralhadora fixa |
| 05 | **Bosque de Ferro** | Floresta e posto florestal | Rastrear transmissor e destruir três repetidores | Visibilidade baixa, aproximação silenciosa, criatura caçadora |
| 06 | **Enfermaria 13** | Hospital militar evacuado | Encontrar a pesquisa de Vilar e abrir o acesso subterrâneo | Terror de corredores, minichefe **Cirurgião** |
| 07 | **A Passagem Branca** | Montanha com neve e fortificações | Escoltar veículo blindado até o elevador da mina | Nevasca, defesa do comboio, canhão fixo |
| 08 | **O Bunker Janus** | Complexo subterrâneo | Obter o Coração de Janus e desativar o gerador | Chefe **Colosso de Ferro**; grande revelação |
| 09 | **Águas Mortas** | Bairro alagado | Abrir comportas e retirar civis | Inimigos aquáticos, minichefe **Afogado-Mor** |
| 10 | **Expresso para o Fim** | Trem e ponte industrial | Impedir a entrega dos três reatores móveis | Combate em vagões, percurso guiado e ação cinematográfica |
| 11 | **Usina do Silêncio** | Fábrica e laboratório | Desligar as três bobinas e alcançar o portal | Combate misto, defesa de objetivos, aparições do Arconte |
| 12 | **Eclipse** | Câmara do portal e ruínas externas | Romper três âncoras e derrotar o Arconte | Chefe final com três fases, escape e epílogo |

**Padrão de fase:** introdução (1–3 min) → avanço (5–8 min) → objetivo intermediário (3–6 min) → encontro de combate (4–8 min) → clímax/saída (3–6 min). Duração real validada em testes.

Cada fase tem **3–5 checkpoints**, um caminho crítico legível, **1–2 rotas laterais** com recursos ou documentos e pelo menos uma paisagem marcante visível ao jogador. Rotas alternativas sempre se reencontram antes do clímax para não duplicar o custo de produção.

## 5. Jogabilidade em primeira pessoa

### 5.1 Controles padrão no PC

| Controle | Ação |
|---|---|
| WASD | Mover |
| Mouse | Olhar |
| Botão esquerdo | Atirar |
| Botão direito | Mirar (ADS) |
| Shift | Correr |
| Ctrl | Agachar |
| Espaço | Pular / subir pequenos obstáculos conforme contexto |
| E | Interagir / usar / coletar |
| R | Recarregar |
| F | Golpe corpo a corpo |
| G | Granada |
| Q | Lanterna / foco especial (quando adquirido) |
| 1–4 / roda do mouse | Selecionar armas e equipamento |
| Tab | Objetivos e mapa simplificado |
| Esc | Pausa, opções e salvar manualmente onde permitido |

**Regras do movimento:** aceleração suave, gravidade, degraus baixos, colisão em cápsula, agachamento com verificação de teto, corrida consumindo fôlego moderado. Nada de parkour complexo na versão inicial. A câmera recebe balanço reduzido e configurável, evitando enjoo.

### 5.2 Combate

- Tiro por raycast para armas hitscan, com dispersão controlada; foguetes e granadas usam projéteis simples.
- Multiplicador de acerto em pontos fracos (ex.: cabeça, núcleo brilhante, costas blindadas) definido por inimigo.
- Reação ao impacto: animação, som, faísca/sangue estilizado e indicador configurável; não precisa simular ragdoll completo.
- Recarga interrompível, custo de tempo claro; munição separada por famílias.
- Cobertura física do cenário, sem sistema complexo de encostar automaticamente.
- Monstros usam ataques telegráficos para o jogador esquivar, recuar ou interromper.
- Dificuldade vem principalmente de posicionamento, tipo de ameaça e suprimentos, não apenas de vida inflada.

### 5.3 Loop central

1. Receber ordem por rádio e localizar a área.
2. Explorar, recolher munição, kits e componentes.
3. Escolher rota e eliminar, contornar ou conter monstros.
4. Cumprir objetivo (chave, transmissão, defesa, evacuação ou sabotagem).
5. Sobreviver ao encontro final, ativar checkpoint e desbloquear melhoria entre missões.

### 5.4 Vida, recursos e checkpoints

- Vida base: 100; colete reduz dano balístico e de estilhaços, mas pouco contra ácido ou ataques do Vazio.
- 1 kit médio restaura 50 de vida; disponibilidade por dificuldade.
- Munição por arma e limite por categoria; caixas posicionadas antes de combates críticos.
- Contaminação do Vazio: medidor usado apenas em missões específicas, causando distorção visual e perseguição quando alto, e com antídotos claramente sinalizados. Não usar mecânica punitiva permanente.
- Autosave em checkpoint, missão concluída e compra de melhoria; salvamento em `localStorage` com schema versionado, validação e migração simples.
- Se houver morte: retornar ao último checkpoint com o inventário registrado naquele ponto; nunca consumir permanentemente recursos ao repetir.

## 6. Armas e acessórios

| Arma | Papel | Pontos fortes | Limitação |
|---|---|---|---|
| Pistola de serviço | Reserva | Rápida, recarga curta | Baixo dano |
| Fuzil semiautomático | Versátil | Precisão e dano consistente | Carregador limitado |
| Submetralhadora | Curta/média distância | Alta cadência, mobilidade | Consome munição |
| Escopeta de trincheira | Combate próximo | Alto impacto, interrompe investidas | Alcance curto |
| Fuzil de ferrolho | Precisão | Grande dano em pontos fracos | Baixa cadência |
| Metralhadora leve | Controle de hordas | Fogo de supressão | Pesada, recarga longa |
| Lança-chamas experimental | Controle de área | Dano contínuo a criaturas vulneráveis | Combustível escasso |
| Projetor Janus | Arma especial | Exposição de núcleos e escudos sobrenaturais | Carga limitada, desbloqueio tardio |

**Melhorias:** cada arma tem até 3 escolhas de melhoria (estabilidade, carregamento, especialização), adquiridas em caixas de manutenção entre missões com sucata de campo. Prioridade: oferecer escolhas significativas, não dezenas de números invisíveis. O Projetor Janus **não substitui** armas históricas, apenas abre janelas de vulnerabilidade em inimigos especiais.

**Granadas:** fragmentação, sinalizadora incendiária, pulso Janus (fase final). Limite de duas categorias equipadas por vez.

## 7. Bestiário e IA

| Inimigo | Papel tático | Ataque e comportamento | Fraqueza | Visual recomendado |
|---|---|---|---|---|
| **Errante** | Massa básica | Corre, cerca e tenta agarrar | Cabeça | 3D próximo / impostor 2D longe |
| **Rastejador** | Flanqueador | Anda baixo, salta de obstáculos | Dorso iluminado | 3D próximo; 2D distante |
| **Eco** | Pressão à distância | Projeta espinhos sonoros e reposiciona | Núcleo no peito | 3D nos combates relevantes |
| **Carapaça** | Tanque lento | Proteção frontal, carga em linha | Costas e pernas | 3D sempre no combate |
| **Sussurrante** | Caçador | Investiga ruídos, apaga luzes, golpe rápido | Luz especial e tiro após a investida | 3D próximo; silhueta 2D decorativa longe |
| **Ninhada** | Criatura pequena | Avança em grupo, desvia de tiros | Área e incendiária | 3D instanciado / sprite conforme distância |
| **Atirador Oco** | Ameaça de posição | Dispara matéria orgânica de cobertura | Pausas entre tiros | 3D ou sprite distante com hitbox |
| **Portador** | Suporte | Reforça criaturas e cria áreas perigosas | Glândulas laterais | 3D quando ativo |
| **Soldado Corrompido** | Elite humanoide | Usa movimentos de patrulha e armas deformadas | Máscara, ponto fraco revelado pelo Janus | 3D em combates de elite |

**IA por máquina de estados:** `Dormant → Patrol → Suspicious → Investigate → Chase → Attack → Recover/Retreat → Dead`. Estados especiais por arquétipo; percepção por distância, ângulo, linha de visão e eventos de som. Navegação por malha/waypoints por setor; nunca recalcular caminhos de todos os inimigos a cada quadro.

**Diretor de encontros:** combina um orçamento de ameaça por sala com limite de unidades ativas. Exemplo inicial no PC: até 8–12 inimigos com IA completa simultânea em encontros comuns; 16–20 apenas em defesa com comportamentos simplificados. Valores são **alvos de prototipação**, corrigidos por profiling. Evitar spawn na visão direta do jogador ou atrás dele sem aviso.

### 7.1 Minichefes

- **Escavador — missão 3:** criatura que escava as laterais da trincheira, rompe paredes pré-fraturadas e fica vulnerável após colidir com sacos de areia reforçados.
- **Cirurgião — missão 6:** cria dois clones frágeis, usa instrumentos alongados e precisa ser interrompido durante sua preparação de ataque.
- **Afogado-Mor — missão 9:** emerge em áreas alagadas, desloca água por ondas e só expõe o núcleo quando as comportas são acionadas.

### 7.2 Chefes principais

**Colosso de Ferro — missão 8:** gigante blindado, aproximadamente 5 m na linguagem visual (escala sujeita a teste). Fase 1: ataque de carga entre pilares; fase 2: placas racham sob disparos e choque de bobinas; fase 3: núcleo exposto por poucos segundos. Arena compacta, cobertura destrutível apenas em peças pré-definidas, checkpoints antes do combate.

**Arconte — missão 12:** criatura inteligente ligada ao portal. Fase 1: projéteis telegrafados e convocação de Errantes; fase 2: três âncoras precisam ser desativadas com o Projetor Janus, sem invulnerabilidade opaca; fase 3: arena alterada, padrões misturados e núcleo exposto após esquiva das rajadas. Derrota seguida de corrida até o elevador e conclusão narrativa. Não usar tela cheia de partículas que esconda os sinais de perigo.

## 8. Ambientes e desenho de fases

- Mapas **segmentados** em setores conectados: estradas, casas, trincheiras, galpões, bunkers, neve, trem e instalação final.
- Cenários prioritariamente **semi-lineares**: trechos amplos o bastante para movimentação, mas com linhas de visão controladas e oclusão por ruínas, curvas e paredes.
- Reuso inteligente: um kit modular de casas, janelas, portas, sacos de areia, trilhos e estruturas industriais com materiais variados.
- Interativos de baixo custo: portas, alavancas, painéis, barris e barricadas com estados simples. Destruição roteirizada em vez de física universal.
- Atmosfera: névoa estratégica, céu 2D, som espacial, iluminação contrastada e poucas luzes dinâmicas.
- Mapas de missão **não ficam todos carregados**; transições descarregam geometria, texturas, áudio e IA sem uso.

## 9. Decisão central: Three.js 3D + 2D para otimização

A regra é usar 3D para **tudo que o jogador examina de perto, mira, percorre ou precisa compreender espacialmente**. Usar 2D apenas quando a câmera, a distância e o enquadramento escondem bem a redução de dimensão. Não trocar inimigos ativos perto da câmera por sprites planos visíveis em ângulos ruins.

| Elemento | Técnica | Motivo |
|---|---|---|
| Jogador, câmera e arma em primeiro plano | **3D** (viewmodel separado) | Mira, animação de tiro, recuo e imersão |
| Chefes e inimigos grandes próximos | **3D** | Silhueta, pontos fracos e ataques legíveis |
| Errantes/Ninhadas próximos | **3D low-poly animado** | Reação e combate confiáveis |
| Tropas ao fundo | **Sprites animados / impostores direcionais 2D** | Menos geometria e animações esqueléticas |
| Árvores e ruínas muito distantes | **Billboards 2D e fundos em camadas** | Horizonte cheio sem modelar tudo |
| Montanhas, fumaça no horizonte, nuvens | **Planos 2D / skybox** | Grande escala aparente |
| Faíscas, flashes, fogo secundário, poeira | **Sprites em atlas e partículas limitadas** | Efeitos baratos quando bem controlados |
| Sangue estilizado/decais de impacto | **Quads 2D no cenário**, atlas compartilhado | Baixo custo e leitura imediata |
| HUD, radar, mira, avisos, menus | **HTML/CSS ou canvas 2D** | Não consome geometria 3D e facilita responsividade |
| Abertura e interlúdios | **Motion comics 2D** | Narração cinematográfica sem rig facial caro |
| Vegetação repetida próxima | **InstancedMesh com geometria simples** | Agrupa desenho das instâncias |
| Parede, chão, abrigo e hitbox | **3D simplificado** | Colisão e navegação corretas |

### 9.1 Distâncias de representação — valores iniciais

- **0–18 m:** modelo 3D completo, animação e hitbox precisa.
- **18–40 m:** LOD 3D simplificado e animação menos frequente; o nível mais distante também pode ser 3D instanciado, quando compatível.
- **40–80 m:** sprite/impostor com 4 ou 8 direções para inimigos comuns, preservando *hitbox 3D invisível* caso ainda possam ser atingidos.
- **Acima de 80 m:** omitir IA e geometria fora do objetivo ou usar silhueta 2D ambiental sem combate.

Os intervalos são **hipóteses de teste**, não valores universais. Usar histerese de distância (ex.: trocar para longe em 42 m e voltar em 36 m) para evitar piscadas, e nunca trocar durante animação crítica ou diante do jogador se a mudança ficar evidente.

### 9.2 Como construir um impostor 2D sem estragar o FPS

1. Criar sprite sheet com quadros de **frente, costas, esquerda, direita** (ou oito ângulos) para idle, deslocamento, ataque, dano e morte.
2. Selecionar a direção pela posição relativa entre inimigo e câmera e selecionar o quadro pelo tempo de animação.
3. O sprite acompanha a localização **3D real** do inimigo, mas a lógica mantém colisão e raycast em volumes invisíveis.
4. Preferir material com corte de transparência (`alphaTest`/shader equivalente) para vegetação e criaturas com bordas duras; evitar muitas camadas de transparência.
5. Se o inimigo entrar em alcance próximo, instanciar/reativar o modelo 3D, alinhar posição, orientação, vida e estado de animação, e ocultar o sprite no mesmo instante.
6. Testar os movimentos de câmera para impedir que personagens pareçam placas giratórias.

**Nota:** Sprites não removem o custo da IA, da atualização de texturas nem automaticamente das draw calls. Agrupar por atlas/material e simplificar a IA distante é indispensável.

### 9.3 Otimizações adicionais obrigatórias

1. **Carregamento por setores:** manter no máximo o setor atual e seus vizinhos mais relevantes; descarregar o restante.
2. **Frustum culling** e oclusão por layout de fase; não enviar para desenho objetos fora da câmera.
3. **InstancedMesh** para itens repetidos (caixas, cercas, pedras, sacos de areia, cápsulas de vegetação), preservando materiais compartilhados.
4. **Mesclagem/batching** para geometria estática compatível, evitando milhares de draw calls.
5. **Texturas compactadas** (ex.: KTX2/Basis, se pipeline suportar) e atlas, com mipmaps e resolução coerente com distância.
6. **Somente uma luz principal com sombra quando possível**; luzes pontuais principalmente sem sombra e efeitos falsos de brilho.
7. **Sombras** limitadas a zona curta do jogador, resolução inicial 1024, desligáveis em qualidade Baixa.
8. **Colisores simplificados** para chão, paredes e personagens; evitar colisão triângulo-a-triângulo em tudo.
9. **Pool de objetos** para balas visuais, partículas, projéteis, sons 3D, decais e inimigos recicláveis.
10. **Ticks escalonados:** IA próxima em 10–15 Hz; IA média em 3–5 Hz; distante dorme, respeitando estados e testes.
11. **Render scale dinâmico** com limites e suavização; aplicar apenas quando FPS cair sustentadamente.
12. **Pós-processamento mínimo:** vinheta, correção de cor e bloom discreto opcional; não encadear muitos passes.
13. **Interiores compartimentados:** portas e curvas controlam quantos cômodos o renderizador vê.
14. **Áudio e sprites sob demanda:** não decodificar todas as falas ou carregar todas as animações ao entrar no site.
15. **Profiler integrado:** medir FPS, draw calls, triângulos, memória estimada, número de IA ativa e tempo de frame.

### 9.4 Orçamento-alvo inicial de performance

| Métrica | PC médio, perfil Equilibrado | PC fraco, perfil Baixo |
|---|---:|---:|
| FPS desejado | 60 | 30–60 |
| Resolução base | 1080p ajustável | 720p ajustável |
| Escala de render | 0,75–1,0 | 0,65–0,85 |
| Draw calls em combate comum | até ~180 | até ~110 |
| Triângulos visíveis em combate comum | até ~450 mil | até ~180 mil |
| IA de combate completa | 8–12 | 5–8 |
| Partículas simultâneas | até ~250 | até ~100 |
| Sombras | 1 luz direcional | off ou reduzida |

Esses números são **metas de orçamento de protótipo**, não garantia de desempenho. Deve-se medir em máquinas reais (GPU, navegador, resolução) e ajustar. Os números de triângulos e draw calls por si só não predizem FPS: shaders, overdraw, luzes, CPU e memória também importam.

### 9.5 Presets de qualidade

- **Baixo:** 720p, sprites mais cedo, sem sombra dinâmica, partículas reduzidas, menor distância de desenho, sem pós-processamento pesado.
- **Equilibrado:** 900p–1080p adaptativo, sombra principal, vegetação moderada, LOD progressivo.
- **Alto:** 1080p ou mais conforme GPU, sombra melhor, distância maior, efeitos extras opcionais. Nunca alterar a lógica de combate por preset.

## 10. Arquitetura técnica sugerida

**Base:** TypeScript + Vite + Three.js; arquivos GLB/glTF para modelos, KTX2/WebP/PNG para texturas, OGG/MP3 para áudio conforme compatibilidade. Three.js renderiza o 3D e os sprites do mundo; HTML/CSS ou Canvas 2D gerenciam HUD e menus. Hospedagem estática em GitHub Pages com caminhos relativos e `base` configurado para o nome do repositório.

```text
src/
  main.ts
  core/
    Game.ts              # estados: menu, gameplay, pausa, loading
    Loop.ts              # loop com delta limitado e física em passo fixo
    EventBus.ts          # eventos entre sistemas
    AssetManager.ts      # cache, preload, unload e fallback
    SaveSystem.ts        # saves versionados e checkpoints
    Settings.ts          # qualidade, áudio, controles
  rendering/
    Renderer3D.ts        # câmera, sombras, pós-processamento
    LODManager.ts        # 3D <-> impostor 2D, histerese
    SpriteAtlas.ts       # atlases e animação por quadros
    WorldStreamer.ts     # setores visíveis e carregamento
    EffectsPool.ts       # partículas, impactos, decais
  player/
    FPSController.ts     # Pointer Lock, movimentação e colisão
    Inventory.ts
    WeaponSystem.ts
    ViewModel.ts
  combat/
    DamageSystem.ts
    ProjectileSystem.ts
    HitboxSystem.ts
    EncounterDirector.ts
  ai/
    EnemyBrain.ts        # estados e comportamento
    Perception.ts
    Navigation.ts
    EnemyFactory.ts
  missions/
    MissionManager.ts
    ObjectiveSystem.ts
    CheckpointManager.ts
    BossDirector.ts
  ui/
    HUD.ts
    Menus.ts
    Subtitles.ts
    Accessibility.ts
  audio/
    AudioManager.ts
    RadioSystem.ts
  data/
    weapons.json
    enemies.json
    upgrades.json
    missions/
  styles/
    ui.css
public/
  assets/
    models/
    textures/
    sprites/
    audio/
    levels/
```

### 10.1 Separação de simulação e renderização

- **Simulação** guarda posição, vida, estado, velocidade, inventário e missão. Não deve depender da aparência 3D/2D.
- **Renderização** observa os dados da simulação; pode alternar a apresentação de um inimigo entre GLB e sprite sem reiniciar a IA.
- **Física** em passo fixo (ex.: 1/60 s), com limite de passos por quadro para não entrar na espiral de lentidão.
- **IA** em frequência menor que o render e distribuída pelos quadros. O render interpola posições quando necessário.
- **Dados JSON** versionados e validados em runtime, para novas armas, inimigos e missões sem reescrever o núcleo.

### 10.2 Esquema de inimigo — referência

```json
{
  "id": "errante",
  "name": "Errante",
  "health": 100,
  "speed": 3.2,
  "damage": 12,
  "weakPoints": [{ "id": "head", "multiplier": 1.8 }],
  "visual": {
    "nearModel": "assets/models/enemies/errante.glb",
    "farSpriteAtlas": "assets/sprites/errante.webp",
    "lodNear": 18,
    "lodMiddle": 40,
    "lodFar": 80
  },
  "behavior": "melee_flanker",
  "threatCost": 1
}
```

As propriedades são contrato proposto; implementá-las e validá-las antes de carregar conteúdo. `lodNear`, `lodMiddle` e `lodFar` descrevem limiares iniciais, sujeitos a histerese e escala de fase.

### 10.3 Pipeline de cenário

1. Bloqueio do mapa com geometria primitiva (graybox).
2. Testar distâncias, linhas de visão, arena, spawn, fuga e checkpoints.
3. Substituir por kit 3D modular otimizado e colisão simplificada.
4. Gerar atlas 2D de árvores, silhuetas e inimigos distantes.
5. Separar o nível em células/setores e registrar gatilhos de streaming.
6. Testar qualidade Baixa antes de acrescentar pós-processamento.

## 11. Direção artística e som

**Visual:** realismo estilizado, sem buscar fotorealismo pesado. Paleta de cinzas azulados, barro, verde militar e luz âmbar; criaturas marcadas por brilho violeta discreto (cor configurável por acessibilidade). Armas e equipamentos com proporções reconhecíveis dos anos 1940, mas sem necessidade de réplicas hiperfiéis ou marcas licenciadas.

**Personagens:** modelo 3D de alta leitura de silhueta (não necessariamente alta contagem poligonal), animações idle, andar, correr, mirar, atirar, receber dano, morrer. Os braços em primeira pessoa têm rig separado do corpo visto no mundo.

**Áudio:** som de disparo com camadas por ambiente, passos por material, ruído de rádio direcional, música dinâmica em combate/terror, alertas sonoros específicos por tipo de monstro. Limitar vozes simultâneas e priorizar inimigos perigosos. Legendas com identificação da fonte.

**Interface:** inspirada em instrumentos militares da década de 1940; HUD limpo, marcador de objetivo, munição, saúde, granadas e aviso de interação. Uma bússola opcional reduz a necessidade de mapas 3D complexos.

## 12. Missões secundárias, progressão e rejogabilidade

- **Objetivos opcionais:** resgatar um sobrevivente, recuperar diário, cortar rádio inimigo, localizar depósito e proteger um aliado.
- **Coletáveis:** 24 documentos e 12 fotografias, vinculados a capítulos para não exigir exploração excessiva.
- **Progressão:** moeda de sucata obtida em objetivos e esconderijos; desbloqueia melhorias permanentes do arsenal. Não exige grind.
- **Rejogabilidade:** seleção de capítulos após concluir, ranking de missão por precisão, segredos encontrados e sobreviventes salvos. Não é necessário pontuar velocidade em missões de horror.
- **Nova partida+:** fora do escopo inicial, possibilidade de atualização.

## 13. Interface e fluxo

**Menu principal:** Continuar, Nova campanha, Seleção de capítulo (após desbloqueio), Arsenal/Bestiário, Opções, Créditos.  
**Pausa:** Retomar, Reiniciar checkpoint, Objetivos, Controles, Opções, Voltar ao menu.  
**Morte:** animação curta, escolha Repetir checkpoint/Voltar ao menu.  
**Carregamento:** nome da missão, breve dica e barra de progresso real dos ativos necessários.  
**Fim de missão:** resultados, documentos encontrados, armamento e botão Próxima missão.

No navegador, mostrar instrução clara de clique para ativar **Pointer Lock**; ao perder foco, pausar a simulação e liberar os controles. Áudio só inicia após gesto do usuário, respeitando as restrições do navegador.

## 14. Produção e prioridades

### Fase A — Protótipo técnico (vertical slice de sistemas)

- FPS jogável: movimentação, mira, tiro, ADS, recarga, vida e HUD.
- 1 cenário pequeno de trincheira com colisão e uma área interna.
- 2 armas, 2 inimigos e 1 objetivo.
- 1 inimigo alterna 3D próximo ↔ 2D distante de forma imperceptível em teste.
- Menu, áudio básico, pausa e perfil de performance.

**Aceite:** 10 minutos de gameplay sem erro bloqueante, mínimo de 30 FPS no hardware-alvo fraco definido em teste, e sem travadas perceptíveis por carregamentos comuns.

### Fase B — Vertical slice de qualidade (missão 3)

- Missão **Trincheira dos Ossos** completa, com início, objetivo, minichefe e final.
- 4 armas, 4 inimigos, checkpoint e salvamento.
- Primeiro conjunto de arte final, efeitos, dublagem temporária e rádio.
- Perfis Baixo/Equilibrado e validação de memória.

**Aceite:** a fase demonstra o visual e o ritmo final; jogadores entendem a fraqueza do minichefe sem tutorial extenso.

### Fase C — Campanha base

- Expandir para 12 missões, 9 arquétipos, 3 minichefes, 2 chefes principais.
- Arsenal completo, progressão, colecionáveis, cutscenes e bestiário.
- Otimizar reutilização de cenários e carregamento de cada fase.

### Fase D — Polimento e lançamento

- Testes de balanceamento nas quatro dificuldades.
- Revisão de colisão, munição, pontuação de objetivos, checkpoints e save.
- Testes em navegadores e GPUs-alvo; corrigir problemas de Pointer Lock e áudio.
- Comprimir assets, validar caminhos relativos e publicar versão estática.
- Criar changelog, licença de assets, créditos e aviso de conteúdo.

### Prioridade MoSCoW

**Must:** FPS funcional, 12 missões, história fechada, inimigos, chefes, save, configurações, otimização 2D/3D.  
**Should:** legendas completas, arsenal melhorável, bestiário, documentação coletável e perfis de qualidade.  
**Could:** modo sobrevivência, Photo Mode, New Game+, conquistas.  
**Won't v1:** multiplayer, ray tracing, mundo aberto contínuo, veículos dirigíveis livres, destruição física universal, editor de mapas público.

## 15. Critérios de qualidade e testes

- **Combate:** todos os tiros atingem a hitbox esperada; recarga, ADS e troca de arma não duplicam munição; tiros em ponto fraco têm feedback.
- **IA:** inimigos não atravessam paredes, não ficam presos sistematicamente e ataques perigosos são sinalizados.
- **LOD 2D/3D:** mesma vida, posição, colisão e estado ao alternar; sprites não ficam do tamanho errado; transição não pisca.
- **Streaming:** fase não permite alcançar setor sem carregamento; memória não cresce indefinidamente ao entrar/sair de áreas.
- **Save:** o jogo retorna da recarga de página ao último checkpoint, com inventário e flags corretos; saves antigos tratados com versão.
- **Progressão:** os 12 capítulos são concluíveis em sequência; chefe final aciona desfecho e créditos.
- **Desempenho:** medição em cenas de corredor, céu aberto, defesa com hordas e chefes, em presets Baixo e Equilibrado.
- **Acessibilidade:** nenhum objetivo depende apenas de cor; legendas e remapeamento funcionam.
- **Segurança web:** conteúdo de dados tratado como dados, sem interpolar HTML não confiável; nenhuma lógica crítica requer credenciais secretas no frontend; dependências atualizadas e arquivos estáticos válidos.

## 16. Matriz de riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Excesso de inimigos derruba FPS | Alto | Diretor de encontros e IA escalonada por distância |
| Sprite 2D quebra imersão | Alto | 3D perto, impostores direcionais longe e teste de transição |
| Campanha grande demais para produção | Alto | Fazer vertical slice primeiro; reutilizar kit modular |
| Animações de monstros custam caro | Médio | Biblioteca de estados comum, poucos rigs, LOD animado |
| Saves quebram entre versões | Alto | Schema de save versionado e migração/testes |
| Assets causam downloads grandes | Médio | Carregamento por fase, GLB comprimido, KTX2/WebP |
| Efeitos de transparência pesam | Médio | Limitar alpha blending, atlases e efeitos de curta duração |
| Chefes injustos ou confusos | Alto | Padrões telegrafados, pontos fracos visíveis e testes de leitura |

## 17. Primeiro marco prático recomendado

**Começar pela missão 3, não pelas 12 de uma vez.** A Trincheira dos Ossos permite validar em um único vertical slice: FPS, armas, cenário de guerra, monstros, espaço interno e externo, progressão de objetivo, minichefe, salvamento e a transição 3D/2D. Depois de estabilizar este núcleo, expandir reutilizando sistemas, não copiando scripts entre fases.

**Checklist da primeira build (MVP):**

- [ ] Menu principal funcional e configurações salvas.
- [ ] FPS 3D com Pointer Lock, colisão, movimentação, mira e recarga.
- [ ] Fuzil semiautomático e escopeta.
- [ ] Errante e Rastejador com IA básica e animações.
- [ ] Sprites direcionais 2D dos dois inimigos a longa distância.
- [ ] Terreno, paredes, trincheira, barricadas e névoa controlada.
- [ ] HUD 2D com saúde, munição e objetivo.
- [ ] Checkpoint com salvamento e reinício.
- [ ] Minichefe Escavador e tela de conclusão.
- [ ] Perfis de qualidade Baixo/Equilibrado, overlay de FPS e métricas.
- [ ] Build de produção testada no GitHub Pages.

## 18. Referências técnicas oficiais de implementação

- Three.js, `InstancedMesh`: https://threejs.org/docs/pages/InstancedMesh.html
- Three.js, sprites e billboards: https://threejs.org/manual/pages/billboards.html
- Three.js, otimização de muitos objetos: https://threejs.org/manual/pages/optimize-lots-of-objects.html
- Documentação principal: https://threejs.org/docs/

**Observação final:** este GDD é uma especificação de desenvolvimento, não afirma que o jogo ou qualquer recurso já esteja implementado. A campanha, os números de balanceamento e os alvos de FPS precisam ser validados em protótipos.
