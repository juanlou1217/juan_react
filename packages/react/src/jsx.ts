import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	ElementType,
	Key,
	Props,
	ReactElementType,
	Ref,
	Type
} from 'shared/ReactTypes';

// jsx 和 createElement返回结果为 ReactElement 的数据
const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	return {
		$$typeof: REACT_ELEMENT_TYPE, // 标识这是一个 React 元素对象
		key, // 元素 key
		type, // 元素类型
		ref, // 元素引用
		props, // 元素属性
		_mark: 'juanlou'
	};
};

// jsx 函数 参数 ： type, config, children
export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	//  React 会从 config 中提取 key 和 ref，剩下的都放到 props 对象
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};

	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}

		// 检查属性是否是 config 对象自身的属性， 防止原型链污染
		if (Object.prototype.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	// 检测是否有子组件 ， 数组 或 单独
	const maybeChildrenLength = maybeChildren.length;
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			// 只有一个的时候，就扁平化 去除 []
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}
	return ReactElement(type, key, ref, props);
};

export const jsxDEV = jsx;
