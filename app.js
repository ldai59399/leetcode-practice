// LeetCode 极速刷题应用
class LeetCodeApp {
    constructor() {
        this.currentMode = 'copy'; // 'copy' 或 'practice'
        this.currentDifficulty = 'all';
        this.currentFilter = 'all';
        this.currentProblem = null;
        this.diamonds = this.loadData('diamonds', 0);
        this.problemStats = this.loadData('problemStats', {});
        this.codeEditor = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStats();
        this.renderProblemList();
    }
    
    initCodeEditor(savedCode = '') {
        if (this.codeEditor) {
            this.codeEditor.toTextArea();
        }
        
        const container = document.getElementById('codePractice');
        container.innerHTML = '';
        
        const textarea = document.createElement('textarea');
        textarea.id = 'codeEditorTextarea';
        textarea.value = savedCode;
        container.appendChild(textarea);
        
        this.codeEditor = CodeMirror.fromTextArea(textarea, {
            mode: 'python',
            theme: 'dracula',
            lineNumbers: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            extraKeys: {
                'Tab': (cm) => {
                    if (cm.somethingSelected()) {
                        cm.indentSelection('add');
                    } else {
                        cm.replaceSelection('    ', 'end');
                    }
                }
            }
        });
        
        setTimeout(() => {
            this.codeEditor.refresh();
        }, 100);
    }
    
    // 从 localStorage 加载数据
    loadData(key, defaultValue) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }
    
    // 保存数据到 localStorage
    saveData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    // 绑定事件
    bindEvents() {
        // 模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMode = e.target.dataset.mode;
            });
        });
        
        // 难度筛选
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.difficulty;
                this.renderProblemList();
            });
        });
        
        // 练习次数筛选
        document.getElementById('filterCount').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderProblemList();
        });
    }
    
    // 更新统计数据
    updateStats() {
        document.getElementById('diamondCount').textContent = this.diamonds;
        
        let completed = 0;
        Object.values(this.problemStats).forEach(stats => {
            if (stats.count > 0) completed++;
        });
        document.getElementById('completedCount').textContent = completed;
    }
    
    // 获取题目练习次数
    getPracticeCount(problemId) {
        return this.problemStats[problemId]?.count || 0;
    }
    
    // 筛选题目
    filterProblems() {
        let filtered = problemsData;
        
        // 按难度筛选
        if (this.currentDifficulty !== 'all') {
            filtered = filtered.filter(p => p.difficulty === this.currentDifficulty);
        }
        
        // 按练习次数筛选
        if (this.currentFilter !== 'all') {
            const filterValue = parseInt(this.currentFilter);
            if (filterValue === 3) {
                filtered = filtered.filter(p => this.getPracticeCount(p.id) >= 3);
            } else {
                filtered = filtered.filter(p => this.getPracticeCount(p.id) === filterValue);
            }
        }
        
        return filtered;
    }
    
    // 渲染题目列表
    renderProblemList() {
        const listContainer = document.getElementById('problemList');
        const filtered = this.filterProblems();
        
        listContainer.innerHTML = filtered.map(problem => {
            const count = this.getPracticeCount(problem.id);
            const difficultyClass = problem.difficulty.toLowerCase();
            
            return `
                <div class="problem-card ${difficultyClass}" onclick="app.openProblem(${problem.id})">
                    <div class="problem-header">
                        <span class="problem-number">#${problem.number}</span>
                        <span class="difficulty-badge ${difficultyClass}">${problem.difficulty}</span>
                    </div>
                    <div class="problem-title">${problem.title}</div>
                    <div class="problem-stats">
                        <span class="practice-count">
                            练习次数: <span class="count">${count}</span>
                        </span>
                        <span>${count > 0 ? '✅' : '📝'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 打开题目
    openProblem(problemId) {
        this.currentProblem = problemsData.find(p => p.id === problemId);
        if (!this.currentProblem) return;
        
        if (this.currentMode === 'copy') {
            this.openCopyMode();
        } else {
            this.openPracticeMode();
        }
    }
    
    // 打开抄写模式
    openCopyMode() {
        document.getElementById('mainPage').classList.remove('active');
        document.getElementById('copyModePage').classList.add('active');
        
        document.getElementById('copyModeTitle').textContent = 
            `${this.currentProblem.number}. ${this.currentProblem.title}`;
        document.getElementById('copyModeDifficulty').textContent = this.currentProblem.difficulty;
        document.getElementById('copyModeDifficulty').className = 
            `difficulty-badge ${this.currentProblem.difficulty.toLowerCase()}`;
        
        document.getElementById('copyModeProblem').innerHTML = 
            this.formatContent(this.currentProblem.description);
        document.getElementById('copyModeSolution').innerHTML = 
            this.formatContent(this.currentProblem.solution);
        
        // 加载之前保存的代码并初始化编辑器
        const savedCode = this.problemStats[this.currentProblem.id]?.code || '';
        this.initCodeEditor(savedCode);
    }
    
    // 打开练习模式
    openPracticeMode() {
        document.getElementById('mainPage').classList.remove('active');
        document.getElementById('practiceModePage').classList.add('active');
        
        document.getElementById('practiceModeTitle').textContent = 
            `${this.currentProblem.number}. ${this.currentProblem.title}`;
        document.getElementById('practiceModeDifficulty').textContent = this.currentProblem.difficulty;
        document.getElementById('practiceModeDifficulty').className = 
            `difficulty-badge ${this.currentProblem.difficulty.toLowerCase()}`;
        
        document.getElementById('practiceModeProblem').innerHTML = 
            this.formatContent(this.currentProblem.description);
        document.getElementById('practiceModeSolution').innerHTML = 
            this.formatContent(this.currentProblem.solution);
        
        // 重置答案显示
        document.getElementById('answerSection').style.display = 'none';
        document.getElementById('showAnswerBtn').style.display = 'inline-block';
    }
    
    // 显示答案
    showAnswer() {
        document.getElementById('answerSection').style.display = 'block';
        document.getElementById('showAnswerBtn').style.display = 'none';
    }
    
    // 完成题目
    completeProblem() {
        if (!this.currentProblem) return;
        
        const problemId = this.currentProblem.id;
        
        // 更新练习次数
        if (!this.problemStats[problemId]) {
            this.problemStats[problemId] = { count: 0, code: '' };
        }
        this.problemStats[problemId].count++;
        
        // 保存代码（抄写模式）
        if (this.currentMode === 'copy' && this.codeEditor) {
            const code = this.codeEditor.getValue();
            this.problemStats[problemId].code = code;
        }
        
        this.saveData('problemStats', this.problemStats);
        
        // 增加钻石
        this.diamonds += 5;
        this.saveData('diamonds', this.diamonds);
        
        // 更新统计
        this.updateStats();
        
        // 显示奖励
        this.showRewardModal();
    }
    
    // 显示奖励弹窗
    showRewardModal() {
        document.getElementById('rewardModal').classList.add('active');
    }
    
    // 关闭奖励弹窗
    closeRewardModal() {
        document.getElementById('rewardModal').classList.remove('active');
        this.goBack();
    }
    
    // 返回列表
    goBack() {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('mainPage').classList.add('active');
        this.currentProblem = null;
        this.renderProblemList();
    }
    
    // 格式化内容（Markdown 解析 + 代码高亮）
    formatContent(content) {
        // 先处理代码块，使用highlight.js高亮
        content = content.replace(/```python\n([\s\S]*?)```/g, (match, code) => {
            const highlighted = hljs.highlight(code.trim(), { language: 'python' }).value;
            return `<pre class="code-block"><code class="language-python hljs">${highlighted}</code></pre>`;
        });
        
        // 处理其他Markdown格式
        content = content
            .replace(/### (.*)/g, '<h4 class="section-title">$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\n/g, '<br>');
        
        return content;
    }
}

// 初始化应用
const app = new LeetCodeApp();
