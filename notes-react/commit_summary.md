# 🤖 React 源码学习笔记


============================================================
📅 2025-10-18 16:54:33 - 提交 0109575e
============================================================

# 📝 feat: 完善核心模块设计 Reconciler 架构 递归创建Fiber树

> **提交**: `0109575e` | **时间**: 2025-10-18 16:54:33 | **作者**: juanlou1217

基于这次提交的代码变更，我来为你生成一份详细的学习笔记，帮助你深入理解 React Reconciler 架构的核心实现：

## 🔧 技术实现

### 1. Fiber 架构核心数据结构
这次提交实现了 React Fiber 架构的核心数据结构：

```typescript
// Fiber 节点基本信息
tag: WorkTag;         // Fiber 类型标识
key: Key;             // Diff 算法关键标识
type: any;            // 组件类型或 DOM 标签
stateNode: any;       // 对应的真实 DOM 或组件实例

// Fiber 树形结构
return: FiberNode | null;  // 父节点
child: FiberNode | null;   // 第一个子节点  
sibling: FiberNode | null; // 下一个兄弟节点
index: number;             // 在父节点中的位置

// 状态管理
pendingProps: Props;       // 新的 props
memoizedProps: Props | null; // 上一次渲染的 props
```

### 2. 双缓存机制与 alternate 设计
实现了 React 的核心优化机制 - 双缓存：

```typescript
// current 树 ↔ workInProgress 树 通过 alternate 连接
currentFiber.alternate = workInProgressFiber;
workInProgressFiber.alternate = currentFiber;
```

### 3. 深度优先遍历的工作循环
实现了 React 的递归协调算法：

```
performUnitOfWork()
    ↓
beginWork() - 向下递
    ↓ (处理子节点)
completeWork() - 向上归
```

## 💡 设计思路

### 1. 为什么选择 Fiber 架构？
通过手写实现，理解了 Fiber 架构的设计动机：

**解决 Stack Reconciler 的问题**：
- 之前的递归调用栈无法中断，导致长时间任务阻塞主线程
- Fiber 将递归改为可中断的循环，支持时间切片

**支持并发特性**：
- 通过 alternate 双缓存，可以在构建新树时不阻塞当前渲染
- 为 Suspense、并发渲染等特性奠定基础

### 2. 三棵树的设计哲学
代码实现揭示了 React 的三棵树机制：

- **Current 树**：当前屏幕上显示的状态
- **workInProgress 树**：正在构建的新状态
- **历史树**：前一代的 Fiber 树，等待回收或复用

这种设计实现了：
- **无阻塞更新**：构建新树不影响当前渲染
- **状态安全**：更新失败可回退到当前树
- **性能优化**：节点复用减少内存分配

### 3. DFS 遍历的优化考虑
选择深度优先遍历而非广度优先的原因：

```typescript
// DFS 更适合 UI 树的更新模式
function traverse(node) {
  // 1. 先处理当前节点 (beginWork)
  // 2. 递归处理所有子节点
  // 3. 返回处理兄弟节点
  // 4. 完成当前节点 (completeWork)
}
```

**优势**：
- **局部性原理**：父子节点更新通常相关，一起处理缓存友好
- **Effect 收集**：completeWork 阶段可以自底向上收集副作用
- **优先级调度**：可以按子树粒度中断和恢复

## 📚 源码学习收获

### 1. 对 React 更新机制的新理解

**之前认知**：React 的虚拟 DOM Diff 是整体比较
**现在理解**：React 实际上是**增量构建**新树，通过 alternate 指针复用旧节点

```typescript
// 不是整体 Diff，而是增量构建
function beginWork(current, workInProgress) {
  if (current !== null) {
    // 更新：复用或更新现有节点
    // 通过比较 type、key 决定是否复用
  } else {
    // 挂载：创建新节点
  }
}
```

### 2. Props 与 Ref 的生命周期差异

通过实现发现了关键区别：

**Props 工作线**：
- **阶段**：Render 阶段
- **存储**：`pendingProps` → `memoizedProps`
- **作用**：组件渲染逻辑

**Ref 工作线**：  
- **阶段**：Commit 阶段
- **存储**：Fiber 的 `ref` 字段
- **作用**：绑定到真实 DOM/实例

这解释了为什么 ref 在渲染过程中不稳定，而在 commit 后可用。

### 3. Alternate 机制的深层价值

**不仅仅是性能优化**：
```typescript
// 1. 状态递进保证
current.memoizedState → workInProgress.memoizedState

// 2. 安全回退机制  
// 如果更新中断，丢弃 workInProgress，回到 current

// 3. 并发更新基础
// 可以同时存在多个 workInProgress 树
```

### 4. 在 React 整体架构中的位置

通过这次实现，明确了 Reconciler 的承上启下作用：

```
JSX → React Element 
    ↓ (Reconciler 输入)
Fiber 节点创建 (beginWork)
    ↓  
Fiber 树构建 (DFS 遍历)
    ↓
副作用标记 (completeWork)  
    ↓ (Renderer 输入)
DOM 更新 (commit 阶段)
```

### 5. 之前未知的实现细节

**发现 1**：Fiber 的 `index` 字段不只是优化，而是同级节点 Diff 的必要信息

**发现 2**：`alternate` 不是简单的浅拷贝，而是维护了完整的更新链，支持时间旅行调试

**发现 3**：completeWork 阶段会自底向上收集 effectList，这是 commit 阶段高效执行的关键

### 6. 实际开发中的应用价值

**性能优化**：理解了为什么 key 要稳定 - Fiber 复用依赖 key 识别

**调试能力**：知道了如何通过 Fiber 树调试复杂的更新问题

**架构设计**：学习了如何设计可中断的递归算法，这对复杂前端应用有借鉴意义

这次手写实现让你从"使用者"变成了"理解者"，真正掌握了 React 最核心的协调机制，为后续学习并发渲染、Suspense 等高级特性打下了坚实基础。

------------------------------------------------------------


============================================================
📅 2025-10-16 18:10:29 - 提交 3e3da3ed
============================================================

# 📝 feat: 完善打包结果与jsx方法，适应最新版17+编译

> **提交**: `3e3da3ed` | **时间**: 2025-10-16 18:10:29 | **作者**: juanlou1217

基于这次提交的代码变更，我来为你生成一份详细的 React 源码学习笔记：

## 🔧 技术实现

### 1. JSX 运行时适配 React 17+ 新规范
**核心变更**：重构了 `jsx` 函数的参数签名
```javascript
// 之前：支持可变参数 children
const jsx = (type, config, ...maybeChildren) => {
  // 处理 maybeChildren 逻辑
}

// 现在：只接受两个参数，children 通过 config 传递  
const jsx = (type, config) => {
  // 移除了 children 处理逻辑
}
```

### 2. JSX 编译模型的演进理解
**重要概念**：
- **传统编译模式**（React 17 前）：`React.createElement(type, config, ...children)`
- **新 JSX 转换**（React 17+）：`_jsx(type, config)`，其中 `children` 作为 `config` 的属性

### 3. 构建系统优化
- 完善了 Rollup 打包配置，支持 UMD 格式输出
- 自动生成 `package.json` 文件
- 建立了完整的模块发布流程

## 💡 设计思路

### 为什么选择这种实现方式？

**1. 遵循 React 官方规范**
- React 17 引入的新 JSX 转换将 `children` 作为 `config` 的一个属性，而不是单独的参数
- 这样设计使得 JSX 元素的结构更加统一和可预测

**2. 简化运行时逻辑**
```javascript
// 旧逻辑需要处理多种 children 情况
if (maybeChildrenLength === 1) {
  props.children = maybeChildren[0];
} else {
  props.children = maybeChildren;
}

// 新逻辑：编译器在编译阶段就处理好了 children 结构
// 运行时直接使用 config.children
```

**3. 提升 Tree-shaking 效果**
- 新的运行时方式允许打包工具更好地进行死代码消除
- 自动导入 `jsx-runtime`，无需手动引入整个 React

### 实现的优化

**构建流程优化**：
- 统一的模块打包配置
- 自动化的包描述文件生成
- 支持全局链接调试（`pnpm link`）

**标记系统改进**：
```javascript
// 内部标记从 'juanlou' 改为 '_juanlou'
_mark: '_juanlou'  // 更符合内部属性命名约定
```

## 📚 源码学习收获

### 对 React 内部机制的新理解

**1. JSX 编译的两阶段模型**
通过这次实现，我深刻理解了 JSX 处理的完整流程：

```
JSX 代码 → Babel/TypeScript 编译 → 运行时函数调用 → React 元素创建
```

**关键洞察**：React 将 JSX 处理责任分担给了编译器和运行时两部分：
- **编译器**：处理语法转换、children 结构扁平化
- **运行时**：专注于元素创建和属性提取

**2. React 元素的数据结构**
```javascript
const ReactElement = {
  $typeof: REACT_ELEMENT_TYPE, // 标识为 React 元素
  type,      // 元素类型（字符串/函数/类）
  key,       // 列表优化标识
  ref,       // DOM 引用
  props,     // 属性（包含 children）
  _mark: '_juanlou' // 内部标记
}
```

**3. Key 和 Ref 的特殊处理**
学习到 React 如何从配置对象中提取特殊属性：
```javascript
// 这些属性不会进入 props
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
}
```

### 连接 React 整体架构

**1. 协调器（Reconciler）的基础**
这个 JSX 实现创建的元素对象是后续协调过程的基础：
- 虚拟 DOM 的构建起点
- Diff 算法操作的数据结构
- Fiber 架构中 Fiber 节点的创建依据

**2. 组件渲染流程的入口**
```javascript
// 创建的 React 元素会成为
// → render 阶段的输入
// → Fiber 节点创建的模板  
// → 最终 DOM 更新的依据
```

**3. 性能优化的基础**
- `key` 的提取为列表渲染优化提供支持
- 统一的元素结构便于序列化和比较
- 编译时优化为运行时性能打下基础

### 之前不知道的 React 内部细节

**1. 编译时与运行时的分工**
之前以为 JSX 转换完全在运行时完成，现在明白：
- Babel/TypeScript 在编译时处理了大部分结构转换
- 运行时只需要处理标准的对象创建

**2. Children 处理的演进**
React 17 的变革不仅仅是语法糖：
- 减少了运行时的分支判断
- 统一了元素的数据结构
- 为未来的编译器优化铺平道路

**3. 包管理的深层集成**
通过 `pnpm link` 调试理解了：
- 如何建立本地开发环境与测试项目的连接
- 模块解析在真实项目中的工作方式
- 构建产物与实际使用的对应关系

### 实践价值

这个实现帮助我建立了从 JSX 语法到虚拟 DOM 创建的完整心智模型。现在当我写 JSX 时，能清晰地想象出它会被转换成什么 JavaScript 代码，以及 React 内部会如何创建和管理这些元素。这种理解对于调试性能问题、理解渲染行为、以及深入学习 Fiber 架构都提供了坚实的基础。

**关键收获**：React 的设计哲学是"编译时做复杂的事，运行时做简单的事"，这种分工使得运行时更轻量、性能更好。

------------------------------------------------------------

> 手写 React 源码的学习记录，专注于理解 React 内部实现原理
> 
> **学习目标**: 深入理解 React 的核心机制、设计思路和架构原理

