import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dayjs from 'dayjs';
import OpenAI from 'openai';

// 读取 API Key
const openai = new OpenAI({
	baseURL: 'https://api.deepseek.com',
	apiKey: 'sk-407fd99cc42740ed940c559d0d34a436'
});

class LocalAICommitNote {
	constructor() {
		this.notesDir = path.resolve('notes-react/notes');
		this.aiNotesDir = path.resolve('notes-react/ai-notes');
		this.ensureDirectories();
	}

	ensureDirectories() {
		if (!fs.existsSync(this.aiNotesDir)) {
			fs.mkdirSync(this.aiNotesDir, { recursive: true });
			console.log(`📁 创建 AI 笔记目录: ${this.aiNotesDir}`);
		}
	}

	// 获取暂存区中的笔记文件变更
	getNotesChanges() {
		try {
			// 获取暂存区中的所有变更文件
			const stagedFiles = execSync('git diff --staged --name-only', {
				encoding: 'utf-8'
			})
				.trim()
				.split('\n')
				.filter((f) => f);

			// 筛选出 notes 目录下的 MD 文件
			const notesFiles = stagedFiles.filter(
				(file) => file.startsWith('notes-react/notes/') && file.endsWith('.md')
			);

			if (notesFiles.length === 0) {
				return [];
			}

			console.log(`📝 检测到 ${notesFiles.length} 个笔记文件变更:`, notesFiles);

			const changes = [];
			for (const file of notesFiles) {
				try {
					// 获取文件状态
					const status = execSync(
						`git diff --staged --name-status -- "${file}"`,
						{ encoding: 'utf-8' }
					).trim();
					const statusChar = status.charAt(0);

					let noteContent = '';
					let diff = '';

					if (statusChar === 'A') {
						// 新增文件 - 读取完整内容
						noteContent = execSync(`git show :${file}`, { encoding: 'utf-8' });
						diff = '新增笔记文件';
					} else if (statusChar === 'M') {
						// 修改文件 - 获取差异和当前内容
						diff = execSync(`git diff --staged -- "${file}"`, {
							encoding: 'utf-8'
						});
						noteContent = execSync(`git show :${file}`, { encoding: 'utf-8' });
					}

					changes.push({
						file,
						status: statusChar,
						noteContent,
						diff,
						fileName: path.basename(file, '.md')
					});
				} catch (error) {
					console.warn(`⚠️  处理笔记文件 ${file} 时出错:`, error.message);
				}
			}

			return changes;
		} catch (error) {
			console.error('❌ 获取笔记变更失败:', error.message);
			return [];
		}
	}

	// 获取相关的代码变更
	getCodeChanges() {
		try {
			// 获取除笔记外的其他代码文件变更
			const allFiles = execSync('git diff --staged --name-only', {
				encoding: 'utf-8'
			})
				.trim()
				.split('\n')
				.filter((f) => f);

			const codeFiles = allFiles.filter(
				(file) =>
					!file.startsWith('notes-react/') &&
					(file.endsWith('.ts') ||
						file.endsWith('.tsx') ||
						file.endsWith('.js') ||
						file.endsWith('.jsx'))
			);

			if (codeFiles.length === 0) {
				return { files: [], diff: '' };
			}

			// 获取代码文件的差异
			const codeDiff = execSync(
				'git diff --staged -- ' + codeFiles.map((f) => `"${f}"`).join(' '),
				{ encoding: 'utf-8' }
			);

			return {
				files: codeFiles,
				diff: codeDiff.substring(0, 8000) // 限制长度
			};
		} catch (error) {
			console.error('❌ 获取代码变更失败:', error.message);
			return { files: [], diff: '' };
		}
	}

	// 构建 AI 分析提示
	buildPrompt(noteChange, codeChanges) {
		const prompt = `
我正在手写 React 源码并记录学习笔记。请分析以下笔记更新和相关代码变更，生成详细的学习总结：

## 📝 笔记文件变更
**文件**: ${noteChange.file}
**状态**: ${noteChange.status === 'A' ? '新增' : '修改'}

**笔记内容**:
\`\`\`markdown
${noteChange.noteContent.substring(0, 4000)}
\`\`\`

${
	noteChange.status === 'M'
		? `
**笔记变更差异**:
\`\`\`diff
${noteChange.diff.substring(0, 2000)}
\`\`\`
`
		: ''
}

## 💻 相关代码变更
${
	codeChanges.files.length > 0
		? `
**变更文件**: ${codeChanges.files.join(', ')}

**代码差异**:
\`\`\`diff
${codeChanges.diff}
\`\`\`
`
		: '没有检测到相关代码变更'
}

---

请生成一份详细的学习总结，包含以下内容：

## 🎯 学习主题
[根据笔记内容总结本次学习的核心主题]

## 🔧 技术要点
- 笔记中涉及的关键技术概念
- 代码实现的核心逻辑
- React 源码中对应的机制

## 💡 深度理解
- 通过笔记和代码的结合，加深了对哪些概念的理解
- 发现了哪些之前不知道的技术细节
- 这些知识点在 React 整体架构中的位置

## 📚 知识连接
- 本次学习如何与之前的知识点相连接
- 为后续学习哪些模块打下了基础
- 实际开发中可以如何应用这些知识

## 🚀 学习收获
- 最重要的收获和启发
- 需要进一步深入的方向

请用中文回答，内容要深入且实用，重点突出笔记与代码实践的结合。
`;

		return prompt;
	}

	// 调用 AI 生成总结
	async generateSummary(prompt) {
		try {
			const res = await openai.chat.completions.create({
				model: 'deepseek-chat',
				messages: [{ role: 'user', content: prompt }],
				temperature: 0.7,
				max_tokens: 4000
			});
			return res.choices[0].message.content.trim();
		} catch (err) {
			console.error('❌ AI 生成总结失败:', err.message);
			return `# 学习总结生成失败

**时间**: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}
**错误**: ${err.message}

请检查网络连接或 API 配置。`;
		}
	}

	// 保存 AI 总结
	saveAISummary(summary, fileName) {
		const timestamp = dayjs().format('YYYY-MM-DD-HH-mm');
		const aiFileName = `${fileName}-${timestamp}.md`;
		const aiFilePath = path.join(this.aiNotesDir, aiFileName);

		const content = `# 📖 ${fileName} - 学习总结

> **生成时间**: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}
> **原笔记**: notes-react/notes/${fileName}.md

${summary}

---
*🤖 由 AI Commit Note 自动生成*
`;

		fs.writeFileSync(aiFilePath, content, 'utf-8');
		console.log(`✅ AI 学习总结已保存: ${aiFileName}`);
		return aiFileName;
	}

	// 主执行逻辑
	async run() {
		try {
			console.log('🤖 检查笔记文件变更...');

			const notesChanges = this.getNotesChanges();

			if (notesChanges.length === 0) {
				console.log('ℹ️  没有检测到笔记文件变更，跳过 AI 总结生成');
				return;
			}

			const codeChanges = this.getCodeChanges();
			console.log(`💻 检测到 ${codeChanges.files.length} 个代码文件变更`);

			// 为每个变更的笔记文件生成 AI 总结
			for (const noteChange of notesChanges) {
				console.log(`\n📝 正在为 ${noteChange.fileName} 生成学习总结...`);

				const prompt = this.buildPrompt(noteChange, codeChanges);
				const summary = await this.generateSummary(prompt);
				const aiFileName = this.saveAISummary(summary, noteChange.fileName);

				console.log(
					`✨ ${noteChange.fileName} 的学习总结已生成: ${aiFileName}`
				);
			}

			console.log('\n🎉 所有笔记的 AI 学习总结生成完成！');
		} catch (error) {
			console.error('❌ 生成学习总结失败:', error.message);
			process.exit(1);
		}
	}
}

// 运行脚本
const noteGenerator = new LocalAICommitNote();
noteGenerator.run();
