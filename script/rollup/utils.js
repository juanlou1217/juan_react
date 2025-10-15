import path from 'path';
import fs from 'fs';

import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

// eslint-disable-next-line no-undef
const pkgPath = path.resolve(__dirname, '../../packages');
// eslint-disable-next-line no-undef
const distPath = path.resolve(__dirname, '../../dist/modules');

// 解析包的路径 ， 两种 源码路径 打包路径
export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
}

export function getPackageJOSN(pkgName) {
	// 需要包的路径 找到 package.json 文件
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(str);
}

// 两个打包插件 。 ts 与 cks
export function getBaseRollupPlugins(typescrip = {}) {
	return [cjs(), ts(typescrip)];
}
