import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// 导出 ESLint 配置数组
export default [
	js.configs.recommended, // 应用基础 ESLint 推荐配置规则

	// TypeScript 配置部分
	{
		files: ['**/*.ts', '**/*.tsx'],
		// 语言选项配置
		languageOptions: {
			parser: typescriptParser, // 使用 TypeScript 解析器
			ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
			sourceType: 'module' // 使用模块化源码类型
		},
		// 注册插件
		plugins: {
			'@typescript-eslint': typescriptEslint // 注册 TypeScript ESLint 插件
		},
		// 规则配置
		rules: {
			...typescriptEslint.configs.recommended.rules, // 展开 TypeScript 推荐规则
			'@typescript-eslint/ban-ts-comment': 'off' // 关闭禁止使用 @ts-comment 的规则
		}
	},

	// 全局环境变量配置部分
	{
		// 指定该配置适用于所有 JavaScript 和 TypeScript 文件
		files: ['**/*.js', '**/*.ts', '**/*.tsx'],
		languageOptions: {
			globals: {
				browser: 'readonly',
				es2021: 'readonly',
				node: 'readonly'
			}
		}
	},

	// Prettier 集成配置部分
	{
		// 指定该配置适用于所有 JavaScript 和 TypeScript 文件
		files: ['**/*.js', '**/*.ts', '**/*.tsx'],
		plugins: {
			// 注册 Prettier 插件
			prettier: prettier
		},
		// 规则配置
		rules: {
			...prettierConfig.rules, // 展开并应用禁用与 Prettier 冲突的规则
			'prettier/prettier': 'error', // 将 Prettier 错误作为 ESLint 错误处理
			'no-case-declarations': 'off', // 关闭 case 声明检查规则
			'no-constant-condition': 'off' // 关闭常量条件检查规则
		}
	},
	{
		// 文件忽略规则
		ignores: ['**/*.md', 'README.md']
	}
];
