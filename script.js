import * as THREE from 'three';

// ==================== THREE.JS 3D PANDA SETUP ====================
let scene, camera, renderer, pandaGroup, mouth;
let isSpeaking = false;
let mouthOpen = false;
let mouthAnimationInterval = null;

function init3DPanda() {
    const canvas = document.getElementById('pandaCanvas');
    const container = document.querySelector('.panda-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e3a2a);
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1, 0);
    
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 5, 3);
    scene.add(directionalLight);
    
    const backLight = new THREE.PointLight(0xffaa66, 0.5);
    backLight.position.set(0, 2, -2);
    scene.add(backLight);
    
    pandaGroup = new THREE.Group();
    
    // Body (white)
    const bodyGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0;
    pandaGroup.add(body);
    
    // Belly (light cream)
    const bellyGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.4 });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.y = -0.1;
    belly.position.z = 0.55;
    pandaGroup.add(belly);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.85;
    pandaGroup.add(head);
    
    // Black ears
    const earGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const earMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
    
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.5, 1.3, 0);
    leftEar.scale.set(0.8, 1, 0.6);
    pandaGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.5, 1.3, 0);
    rightEar.scale.set(0.8, 1, 0.6);
    pandaGroup.add(rightEar);
    
    // Black eye patches
    const patchGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const patchMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    
    const leftPatch = new THREE.Mesh(patchGeo, patchMat);
    leftPatch.position.set(-0.45, 1.0, 0.65);
    leftPatch.scale.set(1.2, 0.9, 0.6);
    pandaGroup.add(leftPatch);
    
    const rightPatch = new THREE.Mesh(patchGeo, patchMat);
    rightPatch.position.set(0.45, 1.0, 0.65);
    rightPatch.scale.set(1.2, 0.9, 0.6);
    pandaGroup.add(rightPatch);
    
    // Eyes (white part)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.45, 1.02, 0.9);
    pandaGroup.add(leftEyeWhite);
    
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeWhite.position.set(0.45, 1.02, 0.9);
    pandaGroup.add(rightEyeWhite);
    
    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.1, 32, 32);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.45, 1.0, 1.05);
    pandaGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.45, 1.0, 1.05);
    pandaGroup.add(rightPupil);
    
    // Nose (black)
    const noseGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x2c1a0a, roughness: 0.2 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.85, 1.02);
    pandaGroup.add(nose);
    
    // Mouth (red/pink - will animate)
    const mouthGeo = new THREE.SphereGeometry(0.08, 32, 32);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xff6666 });
    mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.75, 1.05);
    pandaGroup.add(mouth);
    
    scene.add(pandaGroup);
    
    // Simple floating animation
    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.003;
        pandaGroup.position.y = Math.sin(time) * 0.03;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
}

// Mouth animation for speaking
function startSpeakingAnimation() {
    if (mouthAnimationInterval) return;
    
    mouthAnimationInterval = setInterval(() => {
        if (mouthOpen) {
            mouth.scale.set(1.5, 0.8, 1);
            mouthOpen = false;
        } else {
            mouth.scale.set(0.8, 1.2, 1);
            mouthOpen = true;
        }
    }, 150);
}

function stopSpeakingAnimation() {
    if (mouthAnimationInterval) {
        clearInterval(mouthAnimationInterval);
        mouthAnimationInterval = null;
    }
    mouth.scale.set(1, 1, 1);
    mouthOpen = false;
}

// ==================== SURVIVAL CHINESE DATA ====================
const survivalData = {
    scenes: [
        {
            id: "visa",
            name: "签证 · 机场",
            init: "🐼 你好！请问你去哪个国家？需要我帮你办理登机手续吗？",
            keywords: ["美国", "中国", "签证", "护照", "登机", "行李", "visa", "passport", "flight", "baggage"],
            correctResponse: "好的！请出示您的护照和签证～",
            wrongResponse: "能告诉我你要去哪里吗？或者需要什么帮助？"
        },
        {
            id: "directions",
            name: "问路 · 校园",
            init: "🐼 同学你好！请问图书馆怎么走？我听说那里有好多书！",
            keywords: ["直走", "左转", "右转", "直行", "左边", "右边", "go straight", "turn left", "right"],
            correctResponse: "哇！你说得很清楚！那我们走吧～",
            wrongResponse: "嗯？我没太听明白～你可以告诉我该往哪个方向走吗？"
        },
        {
            id: "ordering",
            name: "点餐 · 食堂",
            init: "🐼 我想吃辣的，但不要太油～你能帮我跟老板说吗？",
            keywords: ["辣子鸡", "麻婆豆腐", "水煮鱼", "辣", "不油", "少油", "spicy", "not oily"],
            correctResponse: "太棒了！老板说马上就好！",
            wrongResponse: "老板没听清呢～能再说一次你要吃什么吗？"
        },
        {
            id: "shopping",
            name: "购物 · 退货",
            init: "🐼 哎呀，这双鞋尺码不对……怎么退货呀？",
            keywords: ["退货", "换货", "尺码", "不合适", "return", "exchange", "size", "fit"],
            correctResponse: "对对对！这样说明白多了！",
            wrongResponse: "可以告诉我为什么要退货吗？这样店员才能帮你～"
        },
        {
            id: "hospital",
            name: "医院 · 挂号",
            init: "🐼 我肚子疼……请问挂号处在哪儿？",
            keywords: ["挂号处", "挂号", "急诊", "内科", "怎么走", "registration", "emergency", "where"],
            correctResponse: "谢谢！下次不舒服要早点告诉我哦～",
            wrongResponse: "能告诉我挂号处怎么走吗？"
        }
    ]
};

// ==================== DOM Elements ====================
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const speechBtn = document.getElementById('speechBtn');
const pandaSpeech = document.getElementById('pandaSpeech');

// ==================== Global State ====================
let currentScene = null;
let currentSceneIndex = 0;

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

function updatePandaSpeech(text) {
    pandaSpeech.textContent = text;
    pandaSpeech.style.animation = 'none';
    setTimeout(() => {
        pandaSpeech.style.animation = 'bubblePop 0.3s ease-out';
    }, 10);
}

function speakAsPanda(text) {
    updatePandaSpeech(text);
    startSpeakingAnimation();
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.onend = () => {
            stopSpeakingAnimation();
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        setTimeout(() => stopSpeakingAnimation(), text.length * 100);
    }
}

function containsChinese(text) {
    return /[\u4e00-\u9fa5]/.test(text);
}

function isAnswerNatural(userAnswer, keywords) {
    const userLower = userAnswer.toLowerCase().trim();
    for (let keyword of keywords) {
        if (userLower.includes(keyword.toLowerCase())) {
            return true;
        }
    }
    return false;
}

// ==================== Survival Module ====================
function startScene(index = 0) {
    if (!survivalData.scenes.length) return;
    currentScene = survivalData.scenes[index];
    currentSceneIndex = index;
    addMessage('assistant', currentScene.init);
    speakAsPanda(currentScene.init.replace('🐼 ', ''));
}

function processUserAnswer(userText) {
    if (!currentScene) {
        addMessage('assistant', '请先开始对话～');
        speakAsPanda('请先开始对话～');
        return;
    }
    
    const isCorrect = isAnswerNatural(userText, currentScene.keywords);
    
    if (isCorrect) {
        addMessage('assistant', currentScene.correctResponse);
        speakAsPanda(currentScene.correctResponse);
        
        if (currentSceneIndex + 1 < survivalData.scenes.length) {
            setTimeout(() => {
                addMessage('assistant', '🎉 很棒！我们继续下一个场景～');
                speakAsPanda('很棒！我们继续下一个场景～');
                setTimeout(() => startScene(currentSceneIndex + 1), 2000);
            }, 1000);
        } else {
            setTimeout(() => {
                addMessage('assistant', '🎉 恭喜你完成了所有场景！你真棒！');
                speakAsPanda('恭喜你完成了所有场景！你真棒！');
            }, 1000);
        }
    } else {
        addMessage('assistant', currentScene.wrongResponse);
        speakAsPanda(currentScene.wrongResponse);
        if (currentScene.keywords.length > 0) {
            const hint = currentScene.keywords.slice(0, 2).join(" 或 ");
            setTimeout(() => {
                const hintMsg = `💡 提示：你可以说“${hint}”之类的～`;
                addMessage('assistant', hintMsg);
            }, 1000);
        }
    }
}

// ==================== Main Handler ====================
async function handleUserInput(inputText) {
    if (!inputText.trim()) return;
    
    addMessage('user', inputText, true);
    userInput.value = '';
    
    processUserAnswer(inputText);
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
        updatePandaSpeech('🎤 我在听...');
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleUserInput(transcript);
    };
    recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        addMessage('assistant', '语音识别失败，请手动输入～');
        updatePandaSpeech('没听清，可以再说一次吗？');
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

// ==================== Initialize ====================
// Wait for DOM to be fully loaded
window.addEventListener('load', () => {
    init3DPanda();
    initSpeechRecognition();
    startScene(0);
});