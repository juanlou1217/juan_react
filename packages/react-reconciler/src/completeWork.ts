import { FiberNode } from './fiber';
import { beginWork } from './beginWork';

let workInProgress: FiberNode | null = null;

//TODO  流程分为三层：
// 入口层：renderRoot()
// 循环层：workLoop()
// 单元执行层：performUnitOfWork() + completeUnitOfWork()

// 进行初始化的操作
export function prepareFreshStack(root: FiberNode) {
	workInProgress = root;
}

// 渲染根节点
function renderRoot(root: FiberNode) {
	// 初始化创建根节点
	prepareFreshStack(root);

	// 开始递归
	do {
		try {
			workLoop();
		} catch (e) {
			console.warn('workLoop发生错误', e);
			workInProgress = null;
		}
	} while (true);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	// 有子节点就遍历子节点
	const next = beginWork(fiber); // 子 或者 空
	fiber.memoizedProps = fiber.padingProps;
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

//  归
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;

		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return; // 回到父节点
		workInProgress = node;
	} while (node !== null);
}
