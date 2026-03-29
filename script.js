// ==================== EMBEDDED DATA ====================

// Survival scenes with natural conversation flow
const survivalData = {
    scenes: [
        {
            id: "directions",
            name: "问路 · 校园",
            init: "🐼 同学你好！请问图书馆怎么走？我听说那里有好多书！",
            keywords: ["直走", "左转", "直行", "左边", "go straight", "turn left", "left"],
            correctResponse: "哇！你说得很清楚！那我们走吧～",
            wrongResponse: "嗯？我没太听明白～你可以告诉我该往哪个方向走吗？"
        },
        {
            id: "ordering",
            name: "点餐 · 食堂",
            init: "🐼 我想吃辣的，但不要太油～你能帮我跟老板说吗？",
            keywords: ["辣子鸡", "辣", "不油", "少油", "spicy chicken", "spicy", "not oily", "less oil"],
            correctResponse: "太棒了！老板说马上就好！",
            wrongResponse: "老板没听清呢～能再说一次你要吃什么吗？"
        },
        {
            id: "returns",
            name: "网购退货",
            init: "🐼 哎呀，这双鞋尺码不对……怎么退货呀？",
            keywords: ["退货", "尺码", "不合适", "return", "size", "doesn't fit", "wrong size"],
            correctResponse: "对对对！这样说明白多了！",
            wrongResponse: "可以告诉我为什么要退货吗？这样店员才能帮你～"
        },
        {
            id: "hospital",
            name: "医院挂号",
            init: "🐼 我肚子疼……请问挂号处在哪儿？",
            keywords: ["挂号处", "挂号", "怎么走", "registration", "where", "how to get"],
            correctResponse: "谢谢！下次不舒服要早点告诉我哦～",
            wrongResponse: "能告诉我挂号处怎么走吗？"
        },
        {
            id: "checkin",
            name: "机场值机",
            init: "🐼 我要去上海！需要托运一件行李……能帮我办手续吗？",
            keywords: ["靠窗", "窗户", "座位", "window", "seat", "靠窗座位"],
            correctResponse: "好的！靠窗座位，没问题！",
            wrongResponse: "可以告诉工作人员你想要什么座位吗？"
        }
    ]
};

// Cultural buzzwords (custom list)
const customMemes = [
    {
        keyword: "内卷",
        english: "involution",
        meaning: "指竞争激烈，大家都拼命努力，像漩涡一样停不下来。",
        culturalContext: "源于古代科举考生拼命读书，现在形容恶性竞争。",
        example: "我们班同学都学到半夜，真是太卷了。"
    },
    {
        keyword: "躺平",
        english: "lying flat",
        meaning: "放弃激烈竞争，选择低欲望、轻松的生活态度。",
        culturalContext: "现代年轻人对高压生活的一种回应。",
        example: "我不想卷了，准备躺平。"
    },
    {
        keyword: "破防",
        english: "break defense",
        meaning: "心理防线被击破，情绪崩溃或感动到流泪。",
        culturalContext: "网络用语，常用于形容被戳中泪点。",
        example: "看到家乡的视频，我瞬间破防了。"
    },
    {
        keyword: "YYDS",
        english: "yyds",
        meaning: "“永远的神”拼音首字母，形容某人或某物非常厉害。",
        culturalContext: "网络流行语，常用于夸赞。",
        example: "这家店的小笼包，YYDS！"
    }
];

// Volunteer service scenes
const volunteerData = {
    scenes: [
        {
            id: "spring_festival",
            init: "🐼 你好！我是国际学生，为什么中国人过春节要吃饺子呀？",
            keywords: ["饺子", "元宝", "团圆", "财富", "dumpling", "ingot", "reunion", "wealth"],
            correctResponse: "哇！你的解释好有趣！我明白了！",
            wrongResponse: "能再给我讲讲为什么吃饺子吗？"
        },
        {
            id: "dragon_boat",
            init: "🐼 端午节为什么要划龙舟呢？",
            keywords: ["屈原", "纪念", "划船", "救", "qu yuan", "commemorate", "row", "save"],
            correctResponse: "原来是这样！谢谢你的讲解～",
            wrongResponse: "可以告诉我端午节的故事吗？"
        },
        {
            id: "mooncake",
            init: "🐼 中秋节为什么要吃月饼？",
            keywords: ["团圆", "月亮", "分享", "家庭", "reunion", "moon", "share", "family"],
            correctResponse: "真好！我也想和你们一起过中秋节！",
            wrongResponse: "能告诉我月饼代表什么意思吗？"
        }
    ]
};

// ==================== DOM Elements ====================
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const speechBtn = document.getElementById('speechBtn');
const moduleBtns = document.querySelectorAll('.module-btn');

// ==================== Global State ====================
let currentModule = 'survival';
let currentSurvivalScene = null;
let currentSpeechTarget = null;
let currentVolunteerScene = null;

// ==================== Helper Functions ====================
function addMessage(sender, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageDiv.innerHTML = `
        <div class="avatar-icon">${isUser ? '👤' : '🐼'}</div>
        <div class="bubble">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Check if a string contains Chinese characters
function containsChinese(text) {
    return /[\u4e00-\u9fa5]/.test(text);
}

// Natural answer matching - checks if user's answer contains any key concepts
function isAnswerNatural(userAnswer, keywords) {
    const userLower = userAnswer.toLowerCase().trim();
    
    // Check if any keyword appears in user's answer
    for (let keyword of keywords) {
        if (userLower.includes(keyword.toLowerCase())) {
            return true;
        }
    }
    return false;
}

// ==================== English Dictionary API ====================
async function lookupEnglishWord(word) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
        const url = proxyUrl + encodeURIComponent(apiUrl);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const entry = data[0];
            let meanings = [];
            
            if (entry.meanings && entry.meanings.length > 0) {
                for (let meaning of entry.meanings) {
                    if (meaning.definitions && meaning.definitions.length > 0) {
                        meanings.push({
                            partOfSpeech: meaning.partOfSpeech,
                            definition: meaning.definitions[0].definition,
                            example: meaning.definitions[0].example || null
                        });
                    }
                }
            }
            
            return {
                found: true,
                word: word,
                phonetic: entry.phonetic || '',
                meanings: meanings.slice(0, 3)
            };
        }
        return null;
    } catch (error) {
        console.error('English API lookup error:', error);
        return null;
    }
}

// ==================== Chinese Dictionary API (Moedict) ====================
async function lookupChineseWord(word) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = `https://www.moedict.tw/uni/${encodeURIComponent(word)}`;
        const url = proxyUrl + encodeURIComponent(apiUrl);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        
        if (data && data.heteronyms && data.heteronyms.length > 0) {
            const firstMeaning = data.heteronyms[0];
            let definitions = [];
            
            if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
                definitions = firstMeaning.definitions.map(d => d.def);
            }
            
            let pinyin = '';
            if (firstMeaning.bopomofo) {
                pinyin = firstMeaning.bopomofo;
            }
            
            return {
                found: true,
                word: word,
                pinyin: pinyin,
                meanings: definitions.slice(0, 3)
            };
        }
        return null;
    } catch (error) {
        console.error('Chinese API lookup error:', error);
        return null;
    }
}

// ==================== Survival Module (Natural Conversation) ====================
function startSurvivalScene(index = 0) {
    if (!survivalData.scenes.length) return;
    currentSurvivalScene = survivalData.scenes[index];
    addMessage('assistant', currentSurvivalScene.init);
}

function processSurvival(userText) {
    if (!currentSurvivalScene) {
        addMessage('assistant', '请先点击左侧“生存汉语”开始。');
        return;
    }
    
    const isCorrect = isAnswerNatural(userText, currentSurvivalScene.keywords);
    
    if (isCorrect) {
        addMessage('assistant', currentSurvivalScene.correctResponse);
        const currentIndex = survivalData.scenes.findIndex(s => s.id === currentSurvivalScene.id);
        if (currentIndex + 1 < survivalData.scenes.length) {
            addMessage('assistant', '🎉 很棒！我们继续下一个场景～');
            setTimeout(() => startSurvivalScene(currentIndex + 1), 800);
        } else {
            addMessage('assistant', '🎉 恭喜你完成了所有生存汉语场景！你可以点击其他模块继续学习～');
        }
    } else {
        addMessage('assistant', currentSurvivalScene.wrongResponse);
        // Give a helpful hint without forcing exact phrase
        if (currentSurvivalScene.keywords.length > 0) {
            const hint = currentSurvivalScene.keywords.slice(0, 2).join(" 或 ");
            addMessage('assistant', `💡 提示：你可以说“${hint}”之类的～用你自己的话表达就行！`);
        }
    }
}

// ==================== Memes Module ====================
async function processMemes(userText) {
    let keyword = userText.trim();
    if (!keyword) return;
    
    const lowerKeyword = keyword.toLowerCase();
    
    // First, check custom list
    let meme = customMemes.find(m => 
        m.keyword === keyword || 
        (m.english && m.english.toLowerCase() === lowerKeyword)
    );
    
    if (meme) {
        addMessage('assistant', `📖 “${meme.keyword}” 的意思：${meme.meaning}`);
        addMessage('assistant', `🎋 文化背景：${meme.culturalContext}`);
        addMessage('assistant', `🤔 举个栗子：${meme.example}`);
        return;
    }
    
    // Try partial match
    let partialMatch = customMemes.find(m => 
        keyword.includes(m.keyword) ||
        (m.english && lowerKeyword.includes(m.english.toLowerCase()))
    );
    
    if (partialMatch) {
        addMessage('assistant', `📖 “${partialMatch.keyword}” 的意思：${partialMatch.meaning}`);
        addMessage('assistant', `🎋 文化背景：${partialMatch.culturalContext}`);
        addMessage('assistant', `🤔 举个栗子：${partialMatch.example}`);
        return;
    }
    
    // API lookup
    const isChinese = containsChinese(keyword);
    
    if (isChinese) {
        addMessage('assistant', `🔍 正在查询中文词“${keyword}”...`);
        const result = await lookupChineseWord(keyword);
        
        if (result && result.found && result.meanings.length > 0) {
            addMessage('assistant', `📖 “${result.word}” 的解释：`);
            result.meanings.forEach((meaning, index) => {
                addMessage('assistant', `  ${index + 1}. ${meaning}`);
            });
            if (result.pinyin) {
                addMessage('assistant', `🔊 拼音参考：${result.pinyin}`);
            }
        } else {
            addMessage('assistant', `🤔 “${keyword}” 这个词暂时没有找到解释。试试问“内卷”、“躺平”、“破防”吧～`);
        }
    } else {
        addMessage('assistant', `🔍 正在查询英文词“${keyword}”...`);
        const result = await lookupEnglishWord(keyword);
        
        if (result && result.found && result.meanings.length > 0) {
            addMessage('assistant', `📖 “${result.word}” 的英文解释：`);
            result.meanings.forEach((meaning, index) => {
                let msg = `  ${index + 1}. [${meaning.partOfSpeech}] ${meaning.definition}`;
                if (meaning.example) {
                    msg += `\n     📝 例句: ${meaning.example}`;
                }
                addMessage('assistant', msg);
            });
            if (result.phonetic) {
                addMessage('assistant', `🔊 发音：/${result.phonetic}/`);
            }
        } else {
            addMessage('assistant', `🤔 “${keyword}” 这个词暂时没有找到解释。`);
            addMessage('assistant', '📚 试试：内卷、躺平、破防、YYDS、朋友、love、happy...');
        }
    }
}

// ==================== Speech Correction Module ====================
function processSpeech(userText) {
    if (!currentSpeechTarget) {
        currentSpeechTarget = "你好，我叫团团";
        addMessage('assistant', '🎤 试着说出：“你好，我叫团团”');
        return;
    }
    
    const target = currentSpeechTarget;
    const userLower = userText.trim().toLowerCase();
    const targetLower = target.toLowerCase();
    
    if (userLower === targetLower) {
        addMessage('assistant', '✅ 发音非常标准！真棒！');
        if (target === "你好，我叫团团") {
            currentSpeechTarget = "谢谢";
            addMessage('assistant', '🎤 下一句：“谢谢”');
        } else if (target === "谢谢") {
            currentSpeechTarget = "再见";
            addMessage('assistant', '🎤 下一句：“再见”');
        } else {
            addMessage('assistant', '🎉 恭喜你完成了发音练习！');
            currentSpeechTarget = null;
        }
    } else {
        addMessage('assistant', `📢 应该是“${target}”。再试试看？`);
        speakText(target);
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}

// ==================== Volunteer Module ====================
function startVolunteerScene(index = 0) {
    if (!volunteerData.scenes.length) return;
    currentVolunteerScene = volunteerData.scenes[index];
    addMessage('assistant', currentVolunteerScene.init);
}

function processVolunteer(userText) {
    if (!currentVolunteerScene) {
        addMessage('assistant', '请先点击左侧“志愿者服务”开始。');
        return;
    }
    
    const isCorrect = isAnswerNatural(userText, currentVolunteerScene.keywords);
    
    if (isCorrect) {
        addMessage('assistant', currentVolunteerScene.correctResponse);
        const currentIndex = volunteerData.scenes.findIndex(s => s.id === currentVolunteerScene.id);
        if (currentIndex + 1 < volunteerData.scenes.length) {
            addMessage('assistant', '🎉 好棒！我们继续下一个场景～');
            setTimeout(() => startVolunteerScene(currentIndex + 1), 800);
        } else {
            addMessage('assistant', '🎉 你完成了所有志愿者场景！感谢你的付出！');
        }
    } else {
        addMessage('assistant', currentVolunteerScene.wrongResponse);
        if (currentVolunteerScene.keywords.length > 0) {
            const hint = currentVolunteerScene.keywords.slice(0, 2).join(" 或 ");
            addMessage('assistant', `💡 提示：可以提到“${hint}”这些关键词～用你自己的话说！`);
        }
    }
}

// ==================== Main Handler ====================
async function handleUserInput(inputText) {
    if (!inputText.trim()) return;
    
    addMessage('user', inputText, true);
    userInput.value = '';
    
    switch (currentModule) {
        case 'survival':
            processSurvival(inputText);
            break;
        case 'memes':
            await processMemes(inputText);
            break;
        case 'speech':
            processSpeech(inputText);
            break;
        case 'volunteer':
            processVolunteer(inputText);
            break;
        default:
            addMessage('assistant', '请从左侧选择一个模块开始～');
    }
}

// ==================== Module Switching ====================
function switchModule(module) {
    currentModule = module;
    chatMessages.innerHTML = '';
    
    if (module === 'survival') {
        addMessage('assistant', '🌍 生存汉语模块：我会模拟真实场景，用你自己的话回答就行！');
        startSurvivalScene(0);
    } else if (module === 'memes') {
        addMessage('assistant', '📖 文化热词百科：输入任何中文词或英文词，我会自动查字典！');
        addMessage('assistant', '✨ 试试：内卷、朋友、love、happy、美丽...');
    } else if (module === 'speech') {
        addMessage('assistant', '🗣️ 发音纠正模块：试着说出“你好，我叫团团”');
        currentSpeechTarget = "你好，我叫团团";
    } else if (module === 'volunteer') {
        addMessage('assistant', '🤝 志愿者服务：现在你是一名中国志愿者，我来扮演外国学生～');
        startVolunteerScene(0);
    }
}

// ==================== Speech Recognition ====================
let recognition = null;
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('浏览器不支持语音识别');
        if (speechBtn) speechBtn.disabled = true;
        return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
        addMessage('assistant', '🎤 我在听，请说话...');
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleUserInput(transcript);
    };
    recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        addMessage('assistant', '语音识别失败，请手动输入～');
    };
}

function startSpeechInput() {
    if (recognition) {
        recognition.start();
    } else {
        addMessage('assistant', '您的浏览器不支持语音输入～');
    }
}

// ==================== Event Listeners ====================
if (sendBtn) {
    sendBtn.addEventListener('click', () => handleUserInput(userInput.value));
}
if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput(userInput.value);
    });
}
if (speechBtn) {
    speechBtn.addEventListener('click', startSpeechInput);
}

moduleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const module = btn.dataset.module;
        switchModule(module);
    });
});

// ==================== Initialization ====================
switchModule('survival');
initSpeechRecognition();