// 存放FiberNode数据结构
import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

export class FiberNode {
	// ------------------- Fiber 节点基本信息 -------------------
	tag: WorkTag; // Fiber 类型：FunctionComponent / ClassComponent / HostComponent / HostRoot 等
	key: Key; // 唯一标识，用于同级节点 diff 比较
	type: any; // 节点对应的元素类型：DOM 标签名或组件函数/类
	stateNode: any; // 真实世界对象：DOM 节点 / class 实例 / root 容器等
	ref: Ref | null; // ref 对象，用于绑定组件实例或 DOM 引用

	// ------------------- Fiber 树结构 -------------------
	return: FiberNode | null; // 指向父 Fiber
	child: FiberNode | null; // 指向第一个子 Fiber
	sibling: FiberNode | null; // 指向下一个兄弟 Fiber
	index: number; // 在父节点子节点列表中的索引位置

	// ------------------- Props 和更新相关 -------------------
	padingProps: Props; // 本次更新要传给组件的 props（Pending Props）
	memoizedProps: Props | null; // 上一次渲染生效的 props，用于 diff 对比

	// ------------------- 新旧 Fiber 节点 -------------------
	alternate: FiberNode | null;
	flags: Flags;

	// ------------------- 构造函数 -------------------
	constructor(tag: WorkTag, padingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;

		// 真实实例/DOM（暂时 null）
		this.stateNode = null;

		// 元素类型（暂时 null）
		this.type = null;

		// Fiber 树关系初始化
		this.return = null;
		this.child = null;
		this.sibling = null;
		this.index = 0;

		// ref 引用初始化
		this.ref = null;

		// Props 初始化
		this.padingProps = padingProps;
		this.memoizedProps = null;

		// 旧 Fiber
		this.alternate = null;
		// 副作用更新标记
		this.flags = NoFlags;
	}
}
