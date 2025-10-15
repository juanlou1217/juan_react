// 判断当前环境是否支持 Symbol
const supportSymbols = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE = supportSymbols
	? Symbol.for('react.element')
	: 0xeac7;
