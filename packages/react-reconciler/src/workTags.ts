export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText
	| typeof ClassComponent
	| typeof Fragment
	| typeof IndeterminateComponent;

// 函数组件
export const FunctionComponent = 0;
// 类组件
export const ClassComponent = 1;

// 初始化阶段还不确定是函数还是 class
export const IndeterminateComponent = 2;
// React 根节点
export const HostRoot = 3;

// React 原生组件 ，对应 div
export const HostComponent = 5;

// React 原生文本
export const HostText = 6;

// <></> 片段节点
export const Fragment = 7;
