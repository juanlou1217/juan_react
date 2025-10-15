// 定义 React 元素的类型别名
export type Type = any; //  React 对象内部的 type 属性
export type Key = any; // 用于识别列表中元素的唯一键值
export type Props = any; // 组件的属性对象，包含传递给组件的所有属性
export type Ref = any; // 引用，用于访问DOM节点
export type ElementType = any; // JSX 标签中使用的元素类型

export interface ReactElementType {
	$$typeof: symbol | number;
	type: ElementType;
	key: Key;
	ref: Ref;
	props: Props;
	_mark: string;
}
