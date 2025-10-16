import {
	getPackageJOSN,
	resolvePkgPath,
	getBaseRollupPlugins
} from './utils.js';

import generatePackageJson from 'rollup-plugin-generate-package-json';

const { name, module } = getPackageJOSN('react');
// react 包路径与产物路径
const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);

export default [
	{
		// react
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDistPath}/index.js`,
			name: 'React',
			format: 'umd' // UMD 格式（浏览器+Node都可用）
		},
		plugins: [
			...getBaseRollupPlugins(), // TS编译 + CommonJS转换
			generatePackageJson({
				// 自动生成 package.json
				inputFolder: `${pkgPath}`,
				outputFolder: `${pkgDistPath}`,
				baseContents: (pkg) => ({
					name: pkg.name,
					description: pkg.description,
					version: pkg.version,
					main: 'index.js'
				})
			})
		]
	},
	{
		// jsx-runtime
		input: `${pkgPath}/src/jsx.ts`,
		output: [
			// jsx-runtime
			{
				file: `${pkgDistPath}/jsx-runtime.js`,
				name: 'jsx-runtime.js',
				format: 'umd'
			},
			// jsx-dev-runtime
			{
				file: `${pkgDistPath}/jsx-dev-runtime.js`,
				name: 'jsx-dev-runtime',
				format: 'umd'
			}
		],
		plugins: getBaseRollupPlugins()
	}
];
