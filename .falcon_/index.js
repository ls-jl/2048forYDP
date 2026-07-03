var __$_require_board_grid_png__ = "images/9f18a4cae52d62389ce354393b5e1b9f.png";

const memory = {};

var kvStorage = {
  async getStorage(key) {
    return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null
  },
  async setStorage(key, value) {
    memory[key] = String(value);
    return 0
  },
  async removeStorage(key) {
    delete memory[key];
    return 0
  },
  async getStorageKeys() {
    return Object.keys(memory)
  },
  async clearStorage() {
    Object.keys(memory).forEach((key) => {
      delete memory[key];
    });
    return 0
  },
};

const GRID_SIZE = 4;
const START_TILES = 2;
const DEFAULT_FOUR_PROBABILITY = 0.1;
const GAME_STATE_KEY = 'ydp-2048-game-state-v1';
const BEST_SCORE_KEY = 'ydp-2048-best-score-v1';
const SETTINGS_KEY = 'ydp-2048-settings-v1';
const MOVE_ANIMATION_MS = 180;
const POP_ANIMATION_MS = 120;
const MOVE_FRAME_COUNT = 7;
const POP_FRAME_COUNT = 5;
const BOARD_GRID_IMAGE = __$_require_board_grid_png__;

const TILE_THEME = {
  2: { background: '#eee4da', color: '#776e65' },
  4: { background: '#ede0c8', color: '#776e65' },
  8: { background: '#f2b179', color: '#f9f6f2' },
  16: { background: '#f59563', color: '#f9f6f2' },
  32: { background: '#f67c5f', color: '#f9f6f2' },
  64: { background: '#f65e3b', color: '#f9f6f2' },
  128: { background: '#edcf72', color: '#f9f6f2' },
  256: { background: '#edcc61', color: '#f9f6f2' },
  512: { background: '#edc850', color: '#f9f6f2' },
  1024: { background: '#edc53f', color: '#f9f6f2' },
  2048: { background: '#edc22e', color: '#f9f6f2' },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function px(value) {
  return `${Math.round(value)}px`
}

function createEmptyGrid() {
  const cells = [];
  for (let x = 0; x < GRID_SIZE; x += 1) {
    const column = [];
    for (let y = 0; y < GRID_SIZE; y += 1) {
      column.push(null);
    }
    cells.push(column);
  }
  return cells
}

function parseJson(value) {
  if (!value) {
    return null
  }
  try {
    return JSON.parse(value)
  } catch (err) {
    console.log(`parse storage failed ${err}`);
    return null
  }
}

var script = {
  name: 'index',
  data() {
    return {
      grid: createEmptyGrid(),
      tiles: [],
      gridRows: [0, 1, 2, 3],
      gridCols: [0, 1, 2, 3],
      score: 0,
      bestScore: 0,
      scoreAddition: 0,
      boardGridImage: BOARD_GRID_IMAGE,
      over: false,
      won: false,
      keepPlaying: false,
      pendingGameOver: false,
      settingsOpen: false,
      fourProbability: DEFAULT_FOUR_PROBABILITY,
      controlsOnLeft: false,
      nextTileId: 1,
      horizontalSwipeIndex: 1,
      verticalSwipeIndex: 1,
      animationLocked: false,
      layout: {
        deviceWidth: 500,
        deviceHeight: 500,
        logicalWidth: 500,
        logicalHeight: 500,
        shellWidth: 280,
        sidePanelWidth: 120,
        isLandscape: false,
        padding: 12,
        gap: 10,
        boardSize: 280,
        spacing: 10,
        tileSize: 57,
        titleFont: 34,
        scoreFont: 18,
        scoreLabelFont: 10,
        buttonFont: 16,
        buttonHeight: 36,
        compact: false,
      },
    }
  },
  computed: {
    showMessage() {
      return this.over || (this.won && !this.keepPlaying)
    },
    messageText() {
      return this.over ? '游戏结束!' : '你赢了!'
    },
    probabilityLabel() {
      return `${Math.round(this.fourProbability * 100)}%`
    },
    flipLabel() {
      return this.controlsOnLeft ? '开' : '关'
    },
    pageStyle() {
      return {
        position: 'relative',
        width: px(this.layout.deviceWidth),
        height: px(this.layout.deviceHeight),
        backgroundColor: '#faf8ef',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }
    },
    stageStyle() {
      return {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: px(this.layout.logicalWidth),
        height: px(this.layout.logicalHeight),
        backgroundColor: '#faf8ef',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }
    },
    shellStyle() {
      const style = {
        position: 'relative',
        width: px(this.layout.shellWidth),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: this.layout.isLandscape ? 'row' : 'column',
      };
      if (this.layout.isLandscape) {
        style.height = px(this.layout.boardSize);
      }
      return style
    },
    sidePanelStyle() {
      return {
        position: 'relative',
        width: px(this.layout.sidePanelWidth),
        height: px(this.layout.boardSize),
        alignItems: 'stretch',
        justifyContent: 'center',
      }
    },
    boardPanelStyle() {
      return {
        position: 'relative',
        width: px(this.layout.boardSize),
        height: px(this.layout.boardSize),
        marginLeft: this.layout.isLandscape ? px(this.layout.gap) : '0px',
        marginRight: this.layout.isLandscape ? px(this.layout.gap) : '0px',
        zIndex: this.showMessage ? 7 : 2,
      }
    },
    gestureLayerStyle() {
      return {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: px(this.layout.logicalWidth),
        height: px(this.layout.logicalHeight),
        backgroundColor: 'rgba(255, 255, 255, 0)',
        zIndex: 4,
      }
    },
    gestureSliderStyle() {
      return {
        width: px(this.layout.logicalWidth),
        height: px(this.layout.logicalHeight),
      }
    },
    gestureFrameStyle() {
      return {
        position: 'relative',
        width: px(this.layout.logicalWidth),
        height: px(this.layout.logicalHeight),
        backgroundColor: 'rgba(255, 255, 255, 0)',
      }
    },
    topPanelStyle() {
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      const style = {
        position: 'relative',
        width: px(width),
        alignItems: 'stretch',
      };
      if (this.layout.isLandscape) {
        style.height = px(this.layout.boardSize);
        style.justifyContent = 'center';
      } else {
        style.marginBottom = px(this.layout.compact ? 6 : 10);
      }
      return style
    },
    titleStyle() {
      return {
        color: '#776e65',
        fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif',
        fontSize: px(this.layout.titleFont),
        fontWeight: 'bold',
        textAlign: 'center',
        lines: 1,
        height: px(this.layout.titleFont + 8),
        lineHeight: px(this.layout.titleFont + 8),
      }
    },
    scoresStyle() {
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      const gap = this.layout.compact ? 4 : 8;
      return {
        width: px(width),
        height: this.layout.isLandscape ? px(this.scoreBoxHeight() * 2 + gap) : px(this.scoreBoxHeight()),
        flexDirection: this.layout.isLandscape ? 'column' : 'row',
        justifyContent: 'space-between',
      }
    },
    scoreBoxStyle() {
      const gap = this.layout.compact ? 4 : 8;
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : (this.layout.boardSize - gap) / 2;
      return {
        position: 'relative',
        width: px(width),
        height: px(this.scoreBoxHeight()),
        borderRadius: px(Math.max(3, this.layout.boardSize * 0.01)),
        backgroundColor: '#bbada0',
        alignItems: 'center',
      }
    },
    scoreLabelStyle() {
      return {
        marginTop: px(Math.max(3, this.layout.scoreLabelFont * 0.65)),
        color: '#eee4da',
        fontSize: px(this.layout.scoreLabelFont),
        fontWeight: 'bold',
        textAlign: 'center',
        lines: 1,
        height: px(this.layout.scoreLabelFont + 3),
        lineHeight: px(this.layout.scoreLabelFont + 3),
      }
    },
    scoreValueStyle() {
      return {
        color: '#ffffff',
        fontSize: px(this.layout.scoreFont),
        fontWeight: 'bold',
        textAlign: 'center',
        lines: 1,
        height: px(this.layout.scoreFont + 8),
        lineHeight: px(this.layout.scoreFont + 8),
      }
    },
    scoreAdditionStyle() {
      return {
        position: 'absolute',
        right: px(Math.max(4, (this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize) * 0.06)),
        top: px(Math.max(2, this.layout.boardSize * 0.02)),
        color: 'rgba(119, 110, 101, 0.9)',
        fontSize: px(this.layout.scoreFont),
        fontWeight: 'bold',
        lines: 1,
      }
    },
    gameContainerStyle() {
      return {
        position: 'relative',
        width: px(this.layout.boardSize),
        height: px(this.layout.boardSize),
        padding: px(this.layout.spacing),
        backgroundColor: '#bbada0',
        borderRadius: px(Math.max(6, this.layout.spacing * 0.6)),
      }
    },
    gridContainerStyle() {
      return {
        position: 'absolute',
        left: px(this.layout.spacing),
        top: px(this.layout.spacing),
        width: px(this.layout.boardSize - this.layout.spacing * 2),
        height: px(this.layout.boardSize - this.layout.spacing * 2),
        zIndex: 1,
      }
    },
    gridImageStyle() {
      return {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: px(this.layout.boardSize),
        height: px(this.layout.boardSize),
        borderRadius: px(Math.max(6, this.layout.spacing * 0.6)),
        transform: 'translate(0px, 0px)',
        zIndex: 5,
      }
    },
    tileContainerStyle() {
      return {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: px(this.layout.boardSize),
        height: px(this.layout.boardSize),
        zIndex: 6,
      }
    },
    bottomPanelStyle() {
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      const style = {
        position: 'relative',
        width: px(width),
        alignItems: 'stretch',
      };
      if (this.layout.isLandscape) {
        style.height = px(this.layout.boardSize);
        style.justifyContent = 'center';
      } else {
        style.marginTop = px(this.layout.compact ? 8 : 12);
      }
      return style
    },
    mainActionsStyle() {
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      return {
        width: px(width),
        height: px(this.layout.buttonHeight),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: px(this.layout.compact ? 4 : 8),
      }
    },
    actionButtonStyle() {
      const gap = this.layout.compact ? 4 : 10;
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      return {
        position: 'relative',
        width: px((width - gap) / 2),
        height: px(this.layout.buttonHeight),
        lineHeight: px(this.layout.buttonHeight + 2),
        textAlign: 'center',
        color: '#f9f6f2',
        backgroundColor: '#8f7a66',
        borderRadius: px(Math.max(3, this.layout.boardSize * 0.01)),
        fontSize: px(this.layout.buttonFont),
        fontWeight: 'bold',
        lines: 1,
        zIndex: 8,
      }
    },
    settingsPanelStyle() {
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      const padding = this.settingsPadding();
      return {
        position: 'relative',
        width: px(width),
        marginTop: px(this.layout.compact ? 4 : 10),
        padding: px(padding),
        backgroundColor: '#eee4da',
        borderRadius: px(Math.max(4, this.layout.spacing * 0.6)),
        zIndex: 7,
      }
    },
    settingsRowStyle() {
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      const padding = this.settingsPadding();
      const narrowLandscape = this.layout.isLandscape && this.layout.sidePanelWidth < 120;
      return {
        width: px(width - padding * 2),
        flexDirection: narrowLandscape ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }
    },
    settingsRowSecondaryStyle() {
      return Object.assign({}, this.settingsRowStyle, {
        marginTop: px(this.layout.compact ? 4 : 7),
      })
    },
    settingsLabelStyle() {
      return {
        color: '#776e65',
        fontSize: px(Math.max(this.layout.isLandscape ? 8 : 11, this.layout.buttonFont - 2)),
        fontWeight: 'bold',
        lines: 2,
        height: px(this.layout.buttonHeight),
        lineHeight: px(this.layout.buttonHeight / 2),
      }
    },
    probabilityControlStyle() {
      const width = this.layout.isLandscape && this.layout.sidePanelWidth < 120
        ? this.layout.sidePanelWidth - this.settingsPadding() * 2
        : undefined;
      const style = {
        flexDirection: 'row',
        height: px(this.layout.buttonHeight),
        alignItems: 'center',
        justifyContent: 'center',
      };
      if (width) {
        style.width = px(width);
      }
      return style
    },
    stepperButtonStyle() {
      const size = this.layout.buttonHeight;
      return {
        position: 'relative',
        width: px(size),
        height: px(size),
        lineHeight: px(size),
        textAlign: 'center',
        color: '#f9f6f2',
        backgroundColor: '#8f7a66',
        borderRadius: px(3),
        fontSize: px(this.layout.buttonFont),
        fontWeight: 'bold',
        lines: 1,
        zIndex: 8,
      }
    },
    settingsToggleStyle() {
      const width = this.layout.isLandscape ? Math.max(34, this.layout.sidePanelWidth * 0.32) : Math.max(44, this.layout.boardSize * 0.2);
      return {
        position: 'relative',
        width: px(width),
        height: px(this.layout.buttonHeight),
        lineHeight: px(this.layout.buttonHeight + 2),
        textAlign: 'center',
        color: '#f9f6f2',
        backgroundColor: '#8f7a66',
        borderRadius: px(3),
        fontSize: px(this.layout.buttonFont),
        fontWeight: 'bold',
        lines: 1,
        zIndex: 8,
      }
    },
    probabilityValueStyle() {
      return {
        width: px(this.layout.isLandscape ? Math.max(24, this.layout.sidePanelWidth * 0.26) : Math.max(42, this.layout.boardSize * 0.18)),
        height: px(this.layout.buttonHeight),
        lineHeight: px(this.layout.buttonHeight),
        color: '#776e65',
        fontSize: px(this.layout.buttonFont),
        fontWeight: 'bold',
        textAlign: 'center',
        lines: 1,
      }
    },
    settingsActionsStyle() {
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      const padding = this.settingsPadding();
      return {
        width: px(width - padding * 2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: px(this.layout.compact ? 4 : 10),
      }
    },
    settingsButtonStyle() {
      const gap = this.layout.compact ? 4 : 10;
      const width = this.layout.isLandscape ? this.layout.sidePanelWidth : this.layout.boardSize;
      const panelPadding = this.settingsPadding();
      return {
        position: 'relative',
        width: px((width - panelPadding * 2 - gap) / 2),
        height: px(this.layout.buttonHeight),
        lineHeight: px(this.layout.buttonHeight + 2),
        textAlign: 'center',
        color: '#f9f6f2',
        backgroundColor: '#8f7a66',
        borderRadius: px(3),
        fontSize: px(Math.max(this.layout.isLandscape ? 8 : 10, this.layout.buttonFont - 2)),
        fontWeight: 'bold',
        lines: 1,
        zIndex: 8,
      }
    },
    messageStyle() {
      const background = this.over ? 'rgba(238, 228, 218, 0.72)' : 'rgba(237, 194, 46, 0.55)';
      return {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: px(this.layout.boardSize),
        height: px(this.layout.boardSize),
        backgroundColor: background,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }
    },
    messageTitleStyle() {
      return {
        color: this.over ? '#776e65' : '#f9f6f2',
        fontSize: px(clamp(this.layout.boardSize * 0.13, 20, 60)),
        fontWeight: 'bold',
        textAlign: 'center',
        lines: 1,
        height: px(clamp(this.layout.boardSize * 0.16, 26, 70)),
        lineHeight: px(clamp(this.layout.boardSize * 0.16, 26, 70)),
      }
    },
    messageActionsStyle() {
      return {
        marginTop: px(Math.max(10, this.layout.boardSize * 0.1)),
        flexDirection: 'row',
        justifyContent: 'center',
      }
    },
    smallButtonStyle() {
      return {
        marginLeft: px(4),
        marginRight: px(4),
        paddingLeft: px(Math.max(8, this.layout.spacing)),
        paddingRight: px(Math.max(8, this.layout.spacing)),
        height: px(this.layout.buttonHeight),
        lineHeight: px(this.layout.buttonHeight + 2),
        color: '#f9f6f2',
        backgroundColor: '#8f7a66',
        borderRadius: px(3),
        fontSize: px(Math.max(10, this.layout.buttonFont - 1)),
        fontWeight: 'bold',
        textAlign: 'center',
        lines: 1,
      }
    },
  },
  mounted() {
    this.recalculateLayout();
    this.loadGame();
  },
  methods: {
    onShow() {
      this.recalculateLayout();
    },
    onHide() {
      this.saveGameState();
    },
    onUnload() {
      this.saveGameState();
    },
    scoreBoxHeight() {
      return this.layout.isLandscape
        ? clamp(this.layout.boardSize * 0.2, 24, 44)
        : clamp(this.layout.boardSize * 0.16, 34, 62)
    },
    settingsPadding() {
      return this.layout.isLandscape ? Math.max(3, Math.round(this.layout.spacing * 0.55)) : Math.max(6, this.layout.spacing)
    },
    readDeviceSize() {
      let width = 500;
      let height = 500;

      try {
        if (typeof $falcon !== 'undefined' && $falcon.env) {
          width = Number($falcon.env.deviceWidth) || width;
          height = Number($falcon.env.deviceHeight) || height;
        } else if (typeof window !== 'undefined') {
          width = Number(window.innerWidth) || width;
          height = Number(window.innerHeight) || height;
        }
      } catch (err) {
        console.log(`read device size failed ${err}`);
      }

      return { width, height }
    },
    recalculateLayout() {
      const device = this.readDeviceSize();
      const physicalWidth = Math.max(120, device.width);
      const physicalHeight = Math.max(120, device.height);
      const width = physicalWidth;
      const height = physicalHeight;
      const isLandscape = width > height;
      const compact = isLandscape ? (height < 260 || width < 420) : (width < 260 || height < 430);
      const padding = clamp(Math.min(width, height) * 0.04, 6, 20);
      const gap = clamp(Math.min(width, height) * 0.035, compact ? 4 : 6, 16);
      let candidate;
      let sidePanelWidth;

      if (isLandscape) {
        const minPanelWidth = compact ? 48 : 72;
        const byHeight = height - padding * 2;
        const byWidth = width - padding * 2 - gap * 2 - minPanelWidth * 2;
        candidate = clamp(Math.min(byWidth, byHeight), 72, 500);
      } else {
        const titleHeight = compact ? 34 : 52;
        const scoreHeight = clamp(width * 0.11, 34, 62);
        const actionReserve = clamp(width * 0.12, 30, 44);
        const settingsReserve = this.settingsOpen ? (compact ? 122 : 152) : 0;
        const topReserve = titleHeight + scoreHeight + actionReserve + settingsReserve + (compact ? 16 : 24);
        const bottomReserve = compact ? 8 : 12;
        const byWidth = width - padding * 2;
        const byHeight = height - padding * 2 - topReserve - bottomReserve;
        candidate = clamp(Math.min(byWidth, byHeight), 96, 500);
      }

      const spacing = Math.max(isLandscape ? 3 : 4, Math.round(candidate * 15 / 500));
      const tileSize = Math.max(isLandscape ? 12 : 18, Math.floor((candidate - spacing * (GRID_SIZE + 1)) / GRID_SIZE));
      const boardSize = tileSize * GRID_SIZE + spacing * (GRID_SIZE + 1);
      const panelSource = Math.max(0, (width - padding * 2 - boardSize - gap * 2) / 2);

      if (isLandscape) {
        sidePanelWidth = clamp(panelSource, compact ? 48 : 72, compact ? 170 : 190);
      } else {
        sidePanelWidth = boardSize;
      }

      const shellWidth = isLandscape ? (boardSize + sidePanelWidth * 2 + gap * 2) : boardSize;
      const sideBasis = Math.min(sidePanelWidth, boardSize);

      this.layout = {
        deviceWidth: physicalWidth,
        deviceHeight: physicalHeight,
        logicalWidth: width,
        logicalHeight: height,
        shellWidth,
        sidePanelWidth,
        isLandscape,
        padding,
        gap,
        boardSize,
        spacing,
        tileSize,
        titleFont: isLandscape ? clamp(sideBasis * 0.22, 16, 44) : clamp(boardSize * 0.16, 22, 80),
        scoreFont: isLandscape ? clamp(sideBasis * 0.08, 10, 20) : clamp(boardSize * 0.06, 13, 25),
        scoreLabelFont: isLandscape ? clamp(sideBasis * 0.045, 7, 11) : clamp(boardSize * 0.032, 8, 13),
        buttonFont: isLandscape ? clamp(sidePanelWidth * 0.14, 8, 16) : clamp(boardSize * 0.05, 12, 18),
        buttonHeight: isLandscape ? clamp(boardSize * 0.18, 22, 34) : clamp(boardSize * 0.12, 28, 40),
        compact,
      };
    },
    async loadGame() {
      const bestValue = await this.getStorageValue(BEST_SCORE_KEY);
      const bestScore = parseInt(bestValue, 10);
      this.bestScore = Number.isNaN(bestScore) ? 0 : bestScore;

      const settings = parseJson(await this.getStorageValue(SETTINGS_KEY));
      if (settings && typeof settings.fourProbability === 'number') {
        this.fourProbability = clamp(settings.fourProbability, 0, 1);
      }
      if (settings && typeof settings.controlsOnLeft === 'boolean') {
        this.controlsOnLeft = settings.controlsOnLeft;
      }

      const state = parseJson(await this.getStorageValue(GAME_STATE_KEY));
      if (state && state.grid && state.grid.cells && state.over !== true) {
        this.restoreState(state);
      } else {
        this.startFreshGame();
        this.saveGameState();
      }
    },
    restoreState(state) {
      this.grid = createEmptyGrid();
      this.nextTileId = 1;
      for (let x = 0; x < GRID_SIZE; x += 1) {
        for (let y = 0; y < GRID_SIZE; y += 1) {
          const cell = state.grid.cells[x] && state.grid.cells[x][y];
          if (cell) {
            this.grid[x][y] = this.makeTile({ x, y }, cell.value || 2);
          }
        }
      }
      this.score = Number(state.score) || 0;
      this.over = !!state.over;
      this.won = !!state.won;
      this.keepPlaying = !!state.keepPlaying;
      this.pendingGameOver = false;
      if (typeof state.fourProbability === 'number') {
        this.fourProbability = clamp(state.fourProbability, 0, 1);
      }
      if (typeof state.controlsOnLeft === 'boolean') {
        this.controlsOnLeft = state.controlsOnLeft;
      }
      this.bestScore = Math.max(this.bestScore, Number(state.bestScore) || 0, this.score);
      this.updateTiles();
    },
    startFreshGame() {
      this.animationLocked = false;
      this.grid = createEmptyGrid();
      this.nextTileId = 1;
      this.score = 0;
      this.scoreAddition = 0;
      this.over = false;
      this.won = false;
      this.keepPlaying = false;
      this.pendingGameOver = false;
      for (let index = 0; index < START_TILES; index += 1) {
        this.addRandomTile();
      }
      this.updateTiles();
    },
    async restartGame(event) {
      this.preventDefault(event);
      await this.removeStorageValue(GAME_STATE_KEY);
      this.startFreshGame();
      this.saveGameState();
    },
    continueGame(event) {
      this.preventDefault(event);
      this.keepPlaying = true;
      this.saveGameState();
    },
    toggleSettings() {
      this.settingsOpen = !this.settingsOpen;
      this.$nextTick(() => {
        this.recalculateLayout();
      });
    },
    adjustFourProbability(delta) {
      const next = Math.round(clamp(this.fourProbability + delta, 0, 1) * 100) / 100;
      this.fourProbability = next;
      this.saveSettings();
      this.saveGameState();
    },
    toggleControlsSide(event) {
      this.preventDefault(event);
      this.controlsOnLeft = !this.controlsOnLeft;
      this.saveSettings();
      this.saveGameState();
      this.$nextTick(() => {
        this.recalculateLayout();
      });
    },
    resetBestScore() {
      this.bestScore = 0;
      this.setStorageValue(BEST_SCORE_KEY, '0');
      this.saveGameState();
    },
    async clearSavedGame() {
      await this.removeStorageValue(GAME_STATE_KEY);
      this.startFreshGame();
      this.saveGameState();
    },
    makeTile(position, value) {
      const tile = {
        id: this.nextTileId,
        x: position.x,
        y: position.y,
        value: value || 2,
        previousPosition: null,
        mergedFrom: null,
        isNew: false,
        isMerged: false,
      };
      this.nextTileId += 1;
      return tile
    },
    addRandomTile() {
      const cells = this.availableCells();
      if (!cells.length) {
        return
      }
      const cell = cells[Math.floor(Math.random() * cells.length)];
      const value = Math.random() < (1 - this.fourProbability) ? 2 : 4;
      const tile = this.makeTile(cell, value);
      tile.isNew = true;
      this.insertTile(tile);
    },
    availableCells() {
      const cells = [];
      for (let x = 0; x < GRID_SIZE; x += 1) {
        for (let y = 0; y < GRID_SIZE; y += 1) {
          if (!this.grid[x][y]) {
            cells.push({ x, y });
          }
        }
      }
      return cells
    },
    cellsAvailable() {
      return this.availableCells().length > 0
    },
    cellContent(cell) {
      if (this.withinBounds(cell)) {
        return this.grid[cell.x][cell.y]
      }
      return null
    },
    insertTile(tile) {
      this.grid[tile.x][tile.y] = tile;
    },
    removeTile(tile) {
      this.grid[tile.x][tile.y] = null;
    },
    withinBounds(position) {
      return position.x >= 0 && position.x < GRID_SIZE && position.y >= 0 && position.y < GRID_SIZE
    },
    prepareTiles() {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        for (let y = 0; y < GRID_SIZE; y += 1) {
          const tile = this.grid[x][y];
          if (tile) {
            tile.mergedFrom = null;
            tile.previousPosition = { x: tile.x, y: tile.y };
            tile.isNew = false;
            tile.isMerged = false;
          }
        }
      }
    },
    moveTile(tile, cell) {
      this.grid[tile.x][tile.y] = null;
      this.grid[cell.x][cell.y] = tile;
      tile.x = cell.x;
      tile.y = cell.y;
    },
    move(direction, event) {
      this.preventDefault(event);
      if (this.animationLocked || this.isGameTerminated()) {
        return
      }

      const previousScore = this.score;
      const vector = this.getVector(direction);
      const traversals = this.buildTraversals(vector);
      let moved = false;

      this.prepareTiles();

      traversals.x.forEach((x) => {
        traversals.y.forEach((y) => {
          const cell = { x, y };
          const tile = this.cellContent(cell);

          if (tile) {
            const positions = this.findFarthestPosition(cell, vector);
            const next = this.cellContent(positions.next);

            if (next && next.value === tile.value && !next.mergedFrom) {
              const merged = this.makeTile(positions.next, tile.value * 2);
              merged.mergedFrom = [tile, next];
              merged.isMerged = true;

              this.insertTile(merged);
              this.removeTile(tile);
              tile.x = positions.next.x;
              tile.y = positions.next.y;

              this.score += merged.value;
              if (merged.value === 2048) {
                this.won = true;
              }
            } else {
              this.moveTile(tile, positions.farthest);
            }

            if (!this.positionsEqual(cell, tile)) {
              moved = true;
            }
          }
        });
      });

      if (!moved) {
        if (!this.movesAvailable()) {
          this.finishGameOver();
        } else {
          this.updateTiles();
        }
        return
      }

      this.addRandomTile();
      if (!this.movesAvailable()) {
        this.pendingGameOver = true;
      }
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
      }

      const delta = this.score - previousScore;
      if (delta > 0) {
        this.showScoreAddition(delta);
      }

      this.playMoveAnimation();
      if (!this.pendingGameOver) {
        this.saveGameState();
      }
    },
    finishGameOver() {
      this.pendingGameOver = false;
      this.over = true;
      this.animationLocked = false;
      this.clearTransientTileFlags();
      this.updateTiles({
        includeMergedGhosts: false,
        hideNewAndMerged: false,
        popNewAndMerged: false,
        disableMoveTransition: true,
      });
      this.saveGameState();
    },
    getVector(direction) {
      const map = {
        0: { x: 0, y: -1 },
        1: { x: 1, y: 0 },
        2: { x: 0, y: 1 },
        3: { x: -1, y: 0 },
      };
      return map[direction]
    },
    buildTraversals(vector) {
      const traversals = { x: [], y: [] };
      for (let pos = 0; pos < GRID_SIZE; pos += 1) {
        traversals.x.push(pos);
        traversals.y.push(pos);
      }
      if (vector.x === 1) {
        traversals.x = traversals.x.reverse();
      }
      if (vector.y === 1) {
        traversals.y = traversals.y.reverse();
      }
      return traversals
    },
    findFarthestPosition(cell, vector) {
      let previous;
      let current = cell;
      do {
        previous = current;
        current = { x: previous.x + vector.x, y: previous.y + vector.y };
      } while (this.withinBounds(current) && !this.cellContent(current))

      return {
        farthest: previous,
        next: current,
      }
    },
    movesAvailable() {
      return this.cellsAvailable() || this.tileMatchesAvailable()
    },
    tileMatchesAvailable() {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        for (let y = 0; y < GRID_SIZE; y += 1) {
          const tile = this.cellContent({ x, y });
          if (tile) {
            for (let direction = 0; direction < 4; direction += 1) {
              const vector = this.getVector(direction);
              const other = this.cellContent({ x: x + vector.x, y: y + vector.y });
              if (other && other.value === tile.value) {
                return true
              }
            }
          }
        }
      }
      return false
    },
    positionsEqual(first, second) {
      return first.x === second.x && first.y === second.y
    },
    isGameTerminated() {
      return this.over || (this.won && !this.keepPlaying)
    },
    updateTiles(options = {}) {
      const {
        includeMergedGhosts = false,
        moveProgress = null,
        hideNewAndMerged = false,
        popNewAndMerged = false,
        popScale = null,
        disableMoveTransition = true,
      } = options;
      const tiles = [];
      for (let y = 0; y < GRID_SIZE; y += 1) {
        for (let x = 0; x < GRID_SIZE; x += 1) {
          const tile = this.grid[x][y];
          if (tile) {
            tiles.push(this.renderTile(tile, {
              moveProgress,
              hideNewAndMerged,
              popNewAndMerged,
              popScale,
              disableMoveTransition,
            }));

            if (includeMergedGhosts && tile.mergedFrom) {
              tile.mergedFrom.forEach((source, index) => {
                const from = source.previousPosition || { x: source.x, y: source.y };
                tiles.push({
                  renderId: `ghost-${tile.id}-${source.id}-${index}`,
                  id: `ghost-${tile.id}-${source.id}-${index}`,
                  value: source.value,
                  x: tile.x,
                  y: tile.y,
                  fromX: from.x,
                  fromY: from.y,
                  moveProgress,
                  isGhost: true,
                  isNew: false,
                  isMerged: false,
                  innerScale: 1,
                  opacity: 1,
                  disableMoveTransition,
                  disableInnerTransition: true,
                });
              });
            }
          }
        }
      }
      this.tiles = tiles;
    },
    renderTile(tile, options) {
      const from = tile.previousPosition || { x: tile.x, y: tile.y };
      const shouldPop = tile.isNew || tile.isMerged;
      return {
        renderId: `tile-${tile.id}`,
        id: tile.id,
        value: tile.value,
        x: tile.x,
        y: tile.y,
        fromX: from.x,
        fromY: from.y,
        moveProgress: options.moveProgress,
        isGhost: false,
        isNew: tile.isNew,
        isMerged: tile.isMerged,
        innerScale: options.hideNewAndMerged && shouldPop ? 0 : (options.popNewAndMerged && shouldPop ? options.popScale : 1),
        opacity: options.hideNewAndMerged && shouldPop ? 0 : 1,
        disableMoveTransition: options.disableMoveTransition,
        disableInnerTransition: options.hideNewAndMerged,
      }
    },
    playMoveAnimation() {
      this.animationLocked = true;
      this.updateTiles({
        includeMergedGhosts: true,
        moveProgress: 0,
        hideNewAndMerged: true,
        disableMoveTransition: true,
      });

      this.$nextTick(() => {
        this.animateMoveFrame(1);
      });
    },
    animateMoveFrame(frame) {
      if (frame > MOVE_FRAME_COUNT) {
        this.animatePopFrame(0);
        return
      }

      const progress = this.easeOut(frame / MOVE_FRAME_COUNT);
      this.updateTiles({
        includeMergedGhosts: true,
        moveProgress: progress,
        hideNewAndMerged: true,
        disableMoveTransition: true,
      });

      this.runAfter(Math.round(MOVE_ANIMATION_MS / MOVE_FRAME_COUNT), () => {
        this.animateMoveFrame(frame + 1);
      });
    },
    animatePopFrame(frame) {
      if (frame > POP_FRAME_COUNT) {
        this.updateTiles({
          includeMergedGhosts: false,
          hideNewAndMerged: false,
          popNewAndMerged: false,
          disableMoveTransition: true,
        });
        this.clearTransientTileFlags();
        this.animationLocked = false;
        if (this.pendingGameOver) {
          this.finishGameOver();
        }
        return
      }

      const progress = frame / POP_FRAME_COUNT;
      const scale = progress < 0.55
        ? progress / 0.55 * 1.16
        : 1.16 - ((progress - 0.55) / 0.45 * 0.16);
      this.updateTiles({
        includeMergedGhosts: false,
        hideNewAndMerged: false,
        popNewAndMerged: true,
        popScale: scale,
        disableMoveTransition: true,
      });

      this.runAfter(Math.round(POP_ANIMATION_MS / POP_FRAME_COUNT), () => {
        this.animatePopFrame(frame + 1);
      });
    },
    easeOut(progress) {
      return 1 - Math.pow(1 - progress, 3)
    },
    clearTransientTileFlags() {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        for (let y = 0; y < GRID_SIZE; y += 1) {
          const tile = this.grid[x][y];
          if (tile) {
            tile.previousPosition = null;
            tile.mergedFrom = null;
            tile.isNew = false;
            tile.isMerged = false;
          }
        }
      }
    },
    runAfter(ms, callback) {
      if (this.$page && this.$page.setTimeout) {
        this.$page.setTimeout(callback, ms);
      } else {
        setTimeout(callback, ms);
      }
    },
    showScoreAddition(delta) {
      this.scoreAddition = delta;
      const clear = () => {
        this.scoreAddition = 0;
      };
      if (this.$page && this.$page.setTimeout) {
        this.$page.setTimeout(clear, 650);
      } else {
        setTimeout(clear, 650);
      }
    },
    serializeState() {
      const cells = [];
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const column = [];
        for (let y = 0; y < GRID_SIZE; y += 1) {
          const tile = this.grid[x][y];
          column.push(tile ? { position: { x, y }, value: tile.value } : null);
        }
        cells.push(column);
      }

      return {
        grid: {
          size: GRID_SIZE,
          cells,
        },
        score: this.score,
        bestScore: this.bestScore,
        over: this.over,
        won: this.won,
        keepPlaying: this.keepPlaying,
        fourProbability: this.fourProbability,
        controlsOnLeft: this.controlsOnLeft,
        updatedAt: Date.now(),
      }
    },
    async saveGameState() {
      await this.setStorageValue(BEST_SCORE_KEY, String(this.bestScore));
      await this.saveSettings();
      if (this.over) {
        await this.removeStorageValue(GAME_STATE_KEY);
      } else {
        await this.setStorageValue(GAME_STATE_KEY, JSON.stringify(this.serializeState()));
      }
    },
    async saveSettings() {
      await this.setStorageValue(SETTINGS_KEY, JSON.stringify({
        fourProbability: this.fourProbability,
        controlsOnLeft: this.controlsOnLeft,
      }));
    },
    async getStorageValue(key) {
      try {
        return await kvStorage.getStorage(key)
      } catch (err) {
        console.log(`get storage ${key} failed ${err}`);
        return null
      }
    },
    async setStorageValue(key, value) {
      try {
        await kvStorage.setStorage(key, value);
      } catch (err) {
        console.log(`set storage ${key} failed ${err}`);
      }
    },
    async removeStorageValue(key) {
      try {
        await kvStorage.removeStorage(key);
      } catch (err) {
        console.log(`remove storage ${key} failed ${err}`);
      }
    },
    extractSliderIndex(event) {
      if (typeof event === 'number') {
        return event
      }
      const source = event || {};
      const data = source.data || source.detail || source;
      const index = data.index !== undefined ? data.index : data.value;
      const parsed = Number(index);
      return Number.isNaN(parsed) ? 1 : parsed
    },
    handleHorizontalSwipeChange(event) {
      const index = this.extractSliderIndex(event);
      if (index === 1) {
        return
      }
      this.resetHorizontalSwipe();
      this.move(index < 1 ? 1 : 3);
    },
    handleVerticalSwipeChange(event) {
      const index = this.extractSliderIndex(event);
      if (index === 1) {
        return
      }
      this.resetVerticalSwipe();
      this.move(index < 1 ? 2 : 0);
    },
    resetHorizontalSwipe() {
      this.horizontalSwipeIndex = 1;
      this.$nextTick(() => {
        const slider = this.$refs && this.$refs.horizontalSwipe;
        if (slider && slider.slideTo) {
          slider.slideTo(1, false);
        }
      });
    },
    resetVerticalSwipe() {
      this.verticalSwipeIndex = 1;
      this.$nextTick(() => {
        const slider = this.$refs && this.$refs.verticalSwipe;
        if (slider && slider.slideTo) {
          slider.slideTo(1, false);
        }
      });
    },
    preventDefault(event) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
    },
    tileClass(tile) {
      const classes = ['tile'];
      classes.push(`tile-${tile.value > 2048 ? 'super' : tile.value}`);
      if (tile.isGhost) {
        classes.push('tile-ghost');
      }
      if (tile.isNew) {
        classes.push('tile-new');
      }
      if (tile.isMerged) {
        classes.push('tile-merged');
      }
      return classes
    },
    tileStyle(tile) {
      let tileX = tile.x;
      let tileY = tile.y;
      if (tile.moveProgress !== null && tile.moveProgress !== undefined && tile.fromX !== undefined && tile.fromY !== undefined) {
        tileX = tile.fromX + (tile.x - tile.fromX) * tile.moveProgress;
        tileY = tile.fromY + (tile.y - tile.fromY) * tile.moveProgress;
      }
      const x = this.layout.spacing + tileX * (this.layout.tileSize + this.layout.spacing);
      const y = this.layout.spacing + tileY * (this.layout.tileSize + this.layout.spacing);
      return {
        position: 'absolute',
        width: px(this.layout.tileSize),
        height: px(this.layout.tileSize),
        left: '0px',
        top: '0px',
        transform: `translate(${px(x)}, ${px(y)})`,
        transitionProperty: 'transform',
        transitionDuration: tile.disableMoveTransition ? '0ms' : `${MOVE_ANIMATION_MS}ms`,
        transitionTimingFunction: 'ease-in-out',
        zIndex: tile.isMerged ? 10 : (tile.isGhost ? 9 : 8),
      }
    },
    tileInnerStyle(tile) {
      const theme = this.tileTheme(tile.value);
      return {
        width: px(this.layout.tileSize),
        height: px(this.layout.tileSize),
        borderRadius: px(Math.max(3, this.layout.tileSize * 0.03)),
        backgroundColor: theme.background,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: tile.opacity === undefined ? 1 : tile.opacity,
        transform: `scale(${tile.innerScale === undefined ? 1 : tile.innerScale})`,
        transitionProperty: 'transform, opacity',
        transitionDuration: tile.disableInnerTransition ? '0ms' : `${POP_ANIMATION_MS}ms`,
        transitionTimingFunction: 'ease-in-out',
      }
    },
    tileTextStyle(tile) {
      const theme = this.tileTheme(tile.value);
      return {
        color: theme.color,
        fontSize: px(this.tileFontSize(tile.value)),
        fontWeight: 'bold',
        textAlign: 'center',
        lines: 1,
        height: px(this.layout.tileSize),
        lineHeight: px(this.layout.tileSize),
      }
    },
    tileTheme(value) {
      return TILE_THEME[value] || { background: '#3c3a32', color: '#f9f6f2' }
    },
    tileFontSize(value) {
      if (value >= 10000) {
        return clamp(this.layout.tileSize * 0.26, 8, 30)
      }
      if (value >= 1000) {
        return clamp(this.layout.tileSize * 0.32, 9, 35)
      }
      if (value >= 100) {
        return clamp(this.layout.tileSize * 0.42, 10, 45)
      }
      return clamp(this.layout.tileSize * 0.52, 12, 55)
    },
    gridRowStyle(row) {
      return {
        position: 'absolute',
        left: '0px',
        top: '0px',
        flexDirection: 'row',
        width: px(this.layout.boardSize - this.layout.spacing * 2),
        height: px(this.layout.tileSize),
        transform: `translate(0px, ${px(row * (this.layout.tileSize + this.layout.spacing))})`,
        zIndex: 1,
      }
    },
    gridCellStyle(cell) {
      return {
        width: px(this.layout.tileSize),
        height: px(this.layout.tileSize),
        marginRight: cell === GRID_SIZE - 1 ? '0px' : px(this.layout.spacing),
        borderRadius: px(Math.max(3, this.layout.tileSize * 0.03)),
        backgroundColor: '#cdc1b4',
      }
    },
  },
};

var style_0 = { "_": {
  "game-page": {
    "fontFamily": "\"Clear Sans\", \"Helvetica Neue\", Arial, sans-serif"
  }
} };

var render = function (){
var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: ["game-page"],
    style: _vm.pageStyle
  }, [_c('div', {
    staticClass: ["portrait-stage"],
    style: _vm.stageStyle
  }, [_c('slider', {
    ref: "verticalSwipe",
    staticClass: ["gesture-slider"],
    style: _vm.gestureLayerStyle,
    attrs: {
      "vertical": true,
      "index": _vm.verticalSwipeIndex,
      "showIndicators": false,
      "infinite": false,
      "scrollable": !_vm.showMessage,
      "duration": 120
    },
    on: {
      "change": _vm.handleVerticalSwipeChange
    }
  }, [_c('div', {
    staticClass: ["gesture-frame"],
    style: _vm.gestureFrameStyle
  }), _c('div', {
    staticClass: ["gesture-frame"],
    style: _vm.gestureFrameStyle
  }, [_c('slider', {
    ref: "horizontalSwipe",
    staticClass: ["gesture-slider"],
    style: _vm.gestureSliderStyle,
    attrs: {
      "index": _vm.horizontalSwipeIndex,
      "showIndicators": false,
      "infinite": false,
      "scrollable": !_vm.showMessage,
      "duration": 120
    },
    on: {
      "change": _vm.handleHorizontalSwipeChange
    }
  }, [_c('div', {
    staticClass: ["gesture-frame"],
    style: _vm.gestureFrameStyle
  }), _c('div', {
    staticClass: ["gesture-frame"],
    style: _vm.gestureFrameStyle
  }), _c('div', {
    staticClass: ["gesture-frame"],
    style: _vm.gestureFrameStyle
  })])]), _c('div', {
    staticClass: ["gesture-frame"],
    style: _vm.gestureFrameStyle
  })]), _c('div', {
    staticClass: ["game-shell"],
    style: _vm.shellStyle
  }, [(_vm.layout.isLandscape) ? [_c('div', {
    staticClass: ["side-panel", "side-panel-left"],
    style: _vm.sidePanelStyle
  }, [(_vm.controlsOnLeft) ? _c('div', {
    staticClass: ["top-panel"],
    style: _vm.topPanelStyle
  }, [_c('text', {
    staticClass: ["title"],
    style: _vm.titleStyle
  }, [_vm._v("2048")]), _c('div', {
    staticClass: ["scores"],
    style: _vm.scoresStyle
  }, [_c('div', {
    staticClass: ["score-box"],
    style: _vm.scoreBoxStyle
  }, [_c('text', {
    staticClass: ["score-label"],
    style: _vm.scoreLabelStyle
  }, [_vm._v("SCORE")]), _c('text', {
    staticClass: ["score-value"],
    style: _vm.scoreValueStyle
  }, [_vm._v(_vm._s(_vm.score))]), (_vm.scoreAddition) ? _c('text', {
    staticClass: ["score-addition"],
    style: _vm.scoreAdditionStyle
  }, [_vm._v("+" + _vm._s(_vm.scoreAddition))]) : _vm._e()]), _c('div', {
    staticClass: ["score-box"],
    style: _vm.scoreBoxStyle
  }, [_c('text', {
    staticClass: ["score-label"],
    style: _vm.scoreLabelStyle
  }, [_vm._v("BEST")]), _c('text', {
    staticClass: ["score-value"],
    style: _vm.scoreValueStyle
  }, [_vm._v(_vm._s(_vm.bestScore))])])]), _c('div', {
    staticClass: ["main-actions"],
    style: _vm.mainActionsStyle
  }, [_c('text', {
    staticClass: ["action-button"],
    style: _vm.actionButtonStyle,
    on: {
      "click": _vm.restartGame
    }
  }, [_vm._v("新游戏")]), _c('text', {
    staticClass: ["action-button"],
    style: _vm.actionButtonStyle,
    on: {
      "click": _vm.toggleSettings
    }
  }, [_vm._v("设置")])]), (_vm.settingsOpen) ? _c('div', {
    staticClass: ["settings-panel"],
    style: _vm.settingsPanelStyle
  }, [_c('div', {
    staticClass: ["settings-row"],
    style: _vm.settingsRowStyle
  }, [_c('text', {
    staticClass: ["settings-label"],
    style: _vm.settingsLabelStyle
  }, [_vm._v("生成 4 概率")]), _c('div', {
    staticClass: ["probability-control"],
    style: _vm.probabilityControlStyle
  }, [_c('text', {
    staticClass: ["stepper-button"],
    style: _vm.stepperButtonStyle,
    on: {
      "click": function($event) {
        return _vm.adjustFourProbability(-0.05)
      }
    }
  }, [_vm._v("-")]), _c('text', {
    staticClass: ["probability-value"],
    style: _vm.probabilityValueStyle
  }, [_vm._v(_vm._s(_vm.probabilityLabel))]), _c('text', {
    staticClass: ["stepper-button"],
    style: _vm.stepperButtonStyle,
    on: {
      "click": function($event) {
        return _vm.adjustFourProbability(0.05)
      }
    }
  }, [_vm._v("+")])])]), _c('div', {
    staticClass: ["settings-row"],
    style: _vm.settingsRowSecondaryStyle
  }, [_c('text', {
    staticClass: ["settings-label"],
    style: _vm.settingsLabelStyle
  }, [_vm._v("左右翻转(仅限横屏)")]), _c('div', {
    staticClass: ["probability-control"],
    style: _vm.probabilityControlStyle
  }, [_c('text', {
    staticClass: ["settings-toggle"],
    style: _vm.settingsToggleStyle,
    on: {
      "click": _vm.toggleControlsSide
    }
  }, [_vm._v(_vm._s(_vm.flipLabel))])])]), _c('div', {
    staticClass: ["settings-actions"],
    style: _vm.settingsActionsStyle
  }, [_c('text', {
    staticClass: ["settings-button"],
    style: _vm.settingsButtonStyle,
    on: {
      "click": _vm.resetBestScore
    }
  }, [_vm._v("重置最佳")]), _c('text', {
    staticClass: ["settings-button"],
    style: _vm.settingsButtonStyle,
    on: {
      "click": _vm.clearSavedGame
    }
  }, [_vm._v("清除存档")])])]) : _vm._e()]) : _vm._e()]), _c('div', {
    staticClass: ["board-panel"],
    style: _vm.boardPanelStyle
  }, [_c('div', {
    staticClass: ["game-container"],
    style: _vm.gameContainerStyle
  }, [_c('image', {
    staticClass: ["grid-image"],
    style: _vm.gridImageStyle,
    attrs: {
      "resize": "stretch",
      "src": _vm.boardGridImage
    }
  }), _c('div', {
    staticClass: ["tile-container"],
    style: _vm.tileContainerStyle
  }, _vm._l((_vm.tiles), function(tile) {
    return _c('div', {
      key: tile.renderId,
      class: _vm.tileClass(tile),
      style: _vm.tileStyle(tile)
    }, [_c('div', {
      staticClass: ["tile-inner"],
      style: _vm.tileInnerStyle(tile)
    }, [_c('text', {
      staticClass: ["tile-text"],
      style: _vm.tileTextStyle(tile)
    }, [_vm._v(_vm._s(tile.value))])])])
  }), 0), (_vm.showMessage) ? _c('div', {
    staticClass: ["game-message"],
    style: _vm.messageStyle
  }, [_c('text', {
    staticClass: ["message-title"],
    style: _vm.messageTitleStyle
  }, [_vm._v(_vm._s(_vm.messageText))]), _c('div', {
    staticClass: ["message-actions"],
    style: _vm.messageActionsStyle
  }, [(_vm.won && !_vm.keepPlaying) ? _c('text', {
    staticClass: ["small-button"],
    style: _vm.smallButtonStyle,
    on: {
      "click": _vm.continueGame
    }
  }, [_vm._v("继续")]) : _vm._e(), _c('text', {
    staticClass: ["small-button"],
    style: _vm.smallButtonStyle,
    on: {
      "click": _vm.restartGame
    }
  }, [_vm._v("再试一次")])])]) : _vm._e()])]), _c('div', {
    staticClass: ["side-panel", "side-panel-right"],
    style: _vm.sidePanelStyle
  }, [(!_vm.controlsOnLeft) ? _c('div', {
    staticClass: ["top-panel"],
    style: _vm.topPanelStyle
  }, [_c('text', {
    staticClass: ["title"],
    style: _vm.titleStyle
  }, [_vm._v("2048")]), _c('div', {
    staticClass: ["scores"],
    style: _vm.scoresStyle
  }, [_c('div', {
    staticClass: ["score-box"],
    style: _vm.scoreBoxStyle
  }, [_c('text', {
    staticClass: ["score-label"],
    style: _vm.scoreLabelStyle
  }, [_vm._v("SCORE")]), _c('text', {
    staticClass: ["score-value"],
    style: _vm.scoreValueStyle
  }, [_vm._v(_vm._s(_vm.score))]), (_vm.scoreAddition) ? _c('text', {
    staticClass: ["score-addition"],
    style: _vm.scoreAdditionStyle
  }, [_vm._v("+" + _vm._s(_vm.scoreAddition))]) : _vm._e()]), _c('div', {
    staticClass: ["score-box"],
    style: _vm.scoreBoxStyle
  }, [_c('text', {
    staticClass: ["score-label"],
    style: _vm.scoreLabelStyle
  }, [_vm._v("BEST")]), _c('text', {
    staticClass: ["score-value"],
    style: _vm.scoreValueStyle
  }, [_vm._v(_vm._s(_vm.bestScore))])])]), _c('div', {
    staticClass: ["main-actions"],
    style: _vm.mainActionsStyle
  }, [_c('text', {
    staticClass: ["action-button"],
    style: _vm.actionButtonStyle,
    on: {
      "click": _vm.restartGame
    }
  }, [_vm._v("新游戏")]), _c('text', {
    staticClass: ["action-button"],
    style: _vm.actionButtonStyle,
    on: {
      "click": _vm.toggleSettings
    }
  }, [_vm._v("设置")])]), (_vm.settingsOpen) ? _c('div', {
    staticClass: ["settings-panel"],
    style: _vm.settingsPanelStyle
  }, [_c('div', {
    staticClass: ["settings-row"],
    style: _vm.settingsRowStyle
  }, [_c('text', {
    staticClass: ["settings-label"],
    style: _vm.settingsLabelStyle
  }, [_vm._v("生成 4 概率")]), _c('div', {
    staticClass: ["probability-control"],
    style: _vm.probabilityControlStyle
  }, [_c('text', {
    staticClass: ["stepper-button"],
    style: _vm.stepperButtonStyle,
    on: {
      "click": function($event) {
        return _vm.adjustFourProbability(-0.05)
      }
    }
  }, [_vm._v("-")]), _c('text', {
    staticClass: ["probability-value"],
    style: _vm.probabilityValueStyle
  }, [_vm._v(_vm._s(_vm.probabilityLabel))]), _c('text', {
    staticClass: ["stepper-button"],
    style: _vm.stepperButtonStyle,
    on: {
      "click": function($event) {
        return _vm.adjustFourProbability(0.05)
      }
    }
  }, [_vm._v("+")])])]), _c('div', {
    staticClass: ["settings-row"],
    style: _vm.settingsRowSecondaryStyle
  }, [_c('text', {
    staticClass: ["settings-label"],
    style: _vm.settingsLabelStyle
  }, [_vm._v("左右翻转(仅限横屏)")]), _c('div', {
    staticClass: ["probability-control"],
    style: _vm.probabilityControlStyle
  }, [_c('text', {
    staticClass: ["settings-toggle"],
    style: _vm.settingsToggleStyle,
    on: {
      "click": _vm.toggleControlsSide
    }
  }, [_vm._v(_vm._s(_vm.flipLabel))])])]), _c('div', {
    staticClass: ["settings-actions"],
    style: _vm.settingsActionsStyle
  }, [_c('text', {
    staticClass: ["settings-button"],
    style: _vm.settingsButtonStyle,
    on: {
      "click": _vm.resetBestScore
    }
  }, [_vm._v("重置最佳")]), _c('text', {
    staticClass: ["settings-button"],
    style: _vm.settingsButtonStyle,
    on: {
      "click": _vm.clearSavedGame
    }
  }, [_vm._v("清除存档")])])]) : _vm._e()]) : _vm._e()])] : [_c('div', {
    staticClass: ["top-panel"],
    style: _vm.topPanelStyle
  }, [_c('text', {
    staticClass: ["title"],
    style: _vm.titleStyle
  }, [_vm._v("2048")]), _c('div', {
    staticClass: ["scores"],
    style: _vm.scoresStyle
  }, [_c('div', {
    staticClass: ["score-box"],
    style: _vm.scoreBoxStyle
  }, [_c('text', {
    staticClass: ["score-label"],
    style: _vm.scoreLabelStyle
  }, [_vm._v("SCORE")]), _c('text', {
    staticClass: ["score-value"],
    style: _vm.scoreValueStyle
  }, [_vm._v(_vm._s(_vm.score))]), (_vm.scoreAddition) ? _c('text', {
    staticClass: ["score-addition"],
    style: _vm.scoreAdditionStyle
  }, [_vm._v("+" + _vm._s(_vm.scoreAddition))]) : _vm._e()]), _c('div', {
    staticClass: ["score-box"],
    style: _vm.scoreBoxStyle
  }, [_c('text', {
    staticClass: ["score-label"],
    style: _vm.scoreLabelStyle
  }, [_vm._v("BEST")]), _c('text', {
    staticClass: ["score-value"],
    style: _vm.scoreValueStyle
  }, [_vm._v(_vm._s(_vm.bestScore))])])]), _c('div', {
    staticClass: ["main-actions"],
    style: _vm.mainActionsStyle
  }, [_c('text', {
    staticClass: ["action-button"],
    style: _vm.actionButtonStyle,
    on: {
      "click": _vm.restartGame
    }
  }, [_vm._v("新游戏")]), _c('text', {
    staticClass: ["action-button"],
    style: _vm.actionButtonStyle,
    on: {
      "click": _vm.toggleSettings
    }
  }, [_vm._v("设置")])]), (_vm.settingsOpen) ? _c('div', {
    staticClass: ["settings-panel"],
    style: _vm.settingsPanelStyle
  }, [_c('div', {
    staticClass: ["settings-row"],
    style: _vm.settingsRowStyle
  }, [_c('text', {
    staticClass: ["settings-label"],
    style: _vm.settingsLabelStyle
  }, [_vm._v("生成 4 概率")]), _c('div', {
    staticClass: ["probability-control"],
    style: _vm.probabilityControlStyle
  }, [_c('text', {
    staticClass: ["stepper-button"],
    style: _vm.stepperButtonStyle,
    on: {
      "click": function($event) {
        return _vm.adjustFourProbability(-0.05)
      }
    }
  }, [_vm._v("-")]), _c('text', {
    staticClass: ["probability-value"],
    style: _vm.probabilityValueStyle
  }, [_vm._v(_vm._s(_vm.probabilityLabel))]), _c('text', {
    staticClass: ["stepper-button"],
    style: _vm.stepperButtonStyle,
    on: {
      "click": function($event) {
        return _vm.adjustFourProbability(0.05)
      }
    }
  }, [_vm._v("+")])])]), _c('div', {
    staticClass: ["settings-row"],
    style: _vm.settingsRowSecondaryStyle
  }, [_c('text', {
    staticClass: ["settings-label"],
    style: _vm.settingsLabelStyle
  }, [_vm._v("左右翻转(仅限横屏)")]), _c('div', {
    staticClass: ["probability-control"],
    style: _vm.probabilityControlStyle
  }, [_c('text', {
    staticClass: ["settings-toggle"],
    style: _vm.settingsToggleStyle,
    on: {
      "click": _vm.toggleControlsSide
    }
  }, [_vm._v(_vm._s(_vm.flipLabel))])])]), _c('div', {
    staticClass: ["settings-actions"],
    style: _vm.settingsActionsStyle
  }, [_c('text', {
    staticClass: ["settings-button"],
    style: _vm.settingsButtonStyle,
    on: {
      "click": _vm.resetBestScore
    }
  }, [_vm._v("重置最佳")]), _c('text', {
    staticClass: ["settings-button"],
    style: _vm.settingsButtonStyle,
    on: {
      "click": _vm.clearSavedGame
    }
  }, [_vm._v("清除存档")])])]) : _vm._e()]), _c('div', {
    staticClass: ["board-panel"],
    style: _vm.boardPanelStyle
  }, [_c('div', {
    staticClass: ["game-container"],
    style: _vm.gameContainerStyle
  }, [_c('image', {
    staticClass: ["grid-image"],
    style: _vm.gridImageStyle,
    attrs: {
      "resize": "stretch",
      "src": _vm.boardGridImage
    }
  }), _c('div', {
    staticClass: ["tile-container"],
    style: _vm.tileContainerStyle
  }, _vm._l((_vm.tiles), function(tile) {
    return _c('div', {
      key: tile.renderId,
      class: _vm.tileClass(tile),
      style: _vm.tileStyle(tile)
    }, [_c('div', {
      staticClass: ["tile-inner"],
      style: _vm.tileInnerStyle(tile)
    }, [_c('text', {
      staticClass: ["tile-text"],
      style: _vm.tileTextStyle(tile)
    }, [_vm._v(_vm._s(tile.value))])])])
  }), 0), (_vm.showMessage) ? _c('div', {
    staticClass: ["game-message"],
    style: _vm.messageStyle
  }, [_c('text', {
    staticClass: ["message-title"],
    style: _vm.messageTitleStyle
  }, [_vm._v(_vm._s(_vm.messageText))]), _c('div', {
    staticClass: ["message-actions"],
    style: _vm.messageActionsStyle
  }, [(_vm.won && !_vm.keepPlaying) ? _c('text', {
    staticClass: ["small-button"],
    style: _vm.smallButtonStyle,
    on: {
      "click": _vm.continueGame
    }
  }, [_vm._v("继续")]) : _vm._e(), _c('text', {
    staticClass: ["small-button"],
    style: _vm.smallButtonStyle,
    on: {
      "click": _vm.restartGame
    }
  }, [_vm._v("再试一次")])])]) : _vm._e()])])]], 2)])])
};

var staticRenderFns=[];
render._withStripped = true;
  
const __file = 'src/pages/index/index.vue';
const _scopeId = 'data-v-1badc801';

const _exports = script;

_exports.render = render;
_exports.staticRenderFns = staticRenderFns;
_exports._compiled = true;
_exports._scopeId = _scopeId;
_exports.themes = {};
_exports.style = Object.assign({}, style_0['_']);
_exports.__file = __file;

export { _exports as default };
