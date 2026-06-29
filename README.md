# 2048 for YDP

适配有道词典笔 / Falcon 小程序运行时的 2048 游戏。

## 功能

- 4x4 2048 棋盘，包含移动、合并、胜利、继续游戏、失败判定逻辑。
- 每个数字块使用不同颜色，视觉风格参考 Gabriele Cirulli 版 2048。
- 默认生成 `4` 的概率为 10%，可在设置中调整。
- 保存当前分数、最佳分数、当前局面和设置。
- 支持横屏和竖屏布局；横屏下可在设置中开启 `左右翻转(仅限横屏)`，把分数和操作区移动到棋盘左侧。
- 使用全屏滑动手势层，屏幕任意位置上下左右滑动都可操作棋盘，棋盘本身不会被拖动。

## 开发

开发文档：

- [HaaS UI / Falcon 小程序开发文档](https://www.yuque.com/wcye0k/haasui/)

安装依赖后构建：

```sh
npm install
npm run build
```

构建产物示例：

```text
8001782735702492.0_1_1.amr
```

安装到设备：

```sh
adb push /absolute/path/to/8001782735702492.0_1_1.amr /data/local/tmp/8001782735702492.0_1_1.amr
adb shell miniapp_cli install /data/local/tmp/8001782735702492.0_1_1.amr
adb shell miniapp_cli start 8001782735702492 index
```

## Attribution

This project is a Falcon miniapp adaptation inspired by and visually based on
[Gabriele Cirulli's 2048](https://github.com/gabrielecirulli/2048).

The original 2048 project is licensed under the MIT License:

```text
Copyright (c) 2014 Gabriele Cirulli
```

## License

MIT. See [LICENSE](LICENSE).
