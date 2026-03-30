import * as THREE from 'three';

// ==================== 3D GIANT PANDA SETUP ====================
let scene, camera, renderer, pandaGroup, mouth;
let mouthOpen = false;
let mouthAnimationInterval = null;
let currentSceneIndex = 0;
let currentScene = null;
let waitingForNextScene = false;

// 5 Survival Chinese Scenes (as requested)
const scenes = [
    {
        id: "visa",
        name: "签证 · 机场",
        init: "🐼 你好！欢迎来到中国！请问你的签证准备好了吗？需要我帮你办理登机手续吗？",
        keywords: ["签证", "护照", "登机", "行李", "visa", "passport", "flight", "baggage", "准备好了", "好的", "谢谢"],
        correctResponse: "太好了！请出示您的护照和签证～祝您旅途愉快！",
        wrongResponse: "嗯？能再告诉我一次吗？你的签证准备好了吗？或者需要什么帮助？"
    },
    {
        id: "directions",
        name: "问路 · 校园",
        init: "🐼 同学你好！请问图书馆怎么走？我第一次来这个学校，有点迷路了～",
        keywords: ["直走", "左转", "右转", "直行", "前面", "左边", "右边", "go straight", "turn left", "right", "向前"],
        correctResponse: "哇！谢谢你！你说得很清楚，我现在知道怎么走了！",
        wrongResponse: "我没太听明白～能告诉我该往哪个方向走吗？直走还是转弯？"
    },
    {
        id: "ordering",
        name: "点餐 · 食堂",
        init: "🐼 我有点饿了！我想吃辣的，但不要太油～你能帮我和食堂阿姨说吗？",
        keywords: ["辣子鸡", "麻婆豆腐", "水煮鱼", "辣的", "不油", "少油", "spicy", "chicken", "豆腐", "鱼"],
        correctResponse: "太棒了！老板说马上就好，谢谢你帮我点餐！",
        wrongResponse: "老板没听清呢～能再说一次你想吃什么吗？辣的、不油的？"
    },
    {
        id: "shopping",
        name: "购物 · 退货",
        init: "🐼 哎呀，这双鞋尺码不对，穿不了……你知道怎么退货吗？",
        keywords: ["退货", "换货", "尺码", "不合适", "太大", "太小", "return", "exchange", "size", "fit", "换一个"],
        correctResponse: "对对对！你说得很清楚！这样店员就能帮我了！",
        wrongResponse: "能告诉我为什么要退货吗？尺码不合适还是别的原因？"
    },
    {
        id: "hospital",
        name: "医院 · 挂号",
        init: "🐼 我肚子好疼……请问挂号处在哪儿？我应该挂哪个科？",
        keywords: ["挂号处", "挂号", "急诊", "内科", "怎么走", "registration", "emergency", "医生", "看病"],
        correctResponse: "谢谢！我现在知道了，下次不舒服我会早点来的！",
        wrongResponse: "能告诉我挂号处怎么走吗？或者我应该挂什么科？"
    }
];

// ==================== DOM Elements ====================
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const speechBtn = document.getElementById('speechBtn');
const pandaSpeech = document.getElementById('pandaSpeech');
const currentSceneNameSpan = document.getElementById('currentSceneName');

// ==================== Helper Functions ====================
function addMessage(sender, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageDiv.innerHTML = `<div class="bubble">${text}</div>`;
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

// Natural answer matching with keywords
function isAnswerCorrect(userAnswer, keywords) {
    const userLower = userAnswer.toLowerCase().trim();
    for (let keyword of keywords) {
        if (userLower.includes(keyword.toLowerCase())) {
            return true;
        }
    }
    return false;
}

// ==================== Scene Management ====================
function startScene(index) {
    if (waitingForNextScene) return;
    
    currentScene = scenes[index];
    currentSceneIndex = index;
    currentSceneNameSpan.textContent = currentScene.name;
    addMessage('assistant', currentScene.init);
    speakAsPanda(currentScene.init.replace('🐼 ', ''));
}

function processAnswer(userText) {
    if (waitingForNextScene) {
        addMessage('assistant', '请稍等，我们马上进入下一个场景～');
        return;
    }
    
    if (!currentScene) {
        startScene(0);
        return;
    }
    
    const isCorrect = isAnswerCorrect(userText, currentScene.keywords);
    
    if (isCorrect) {
        addMessage('assistant', currentScene.correctResponse);
        speakAsPanda(currentScene.correctResponse);
        
        waitingForNextScene = true;
        
        if (currentSceneIndex + 1 < scenes.length) {
            setTimeout(() => {
                addMessage('assistant', '🎉 太棒了！我们继续下一个场景吧～');
                speakAsPanda('太棒了！我们继续下一个场景吧～');
                setTimeout(() => {
                    waitingForNextScene = false;
                    startScene(currentSceneIndex + 1);
                }, 2000);
            }, 1500);
        } else {
            setTimeout(() => {
                addMessage('assistant', '🎉 恭喜你！你完成了所有生存汉语场景！你真的很棒！');
                speakAsPanda('恭喜你！你完成了所有生存汉语场景！你真的很棒！');
                setTimeout(() => {
                    waitingForNextScene = false;
                    startScene(0);
                }, 4000);
            }, 1500);
        }
    } else {
        addMessage('assistant', currentScene.wrongResponse);
        speakAsPanda(currentScene.wrongResponse);
        
        // Speech error correction: show correct keywords hint
        setTimeout(() => {
            const hintKeywords = currentScene.keywords.slice(0, 3).join("、");
            const hintMsg = `💡 发音纠正提示：你可以说“${hintKeywords}”这样的词～`;
            addMessage('assistant', hintMsg);
        }, 1000);
    }
}

// ==================== 3D Panda Setup ====================
function init3DPanda() {
    const canvas = document.getElementById('pandaCanvas');
    const container = document.querySelector('.panda-stage');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e4a2a);
    scene.fog = new THREE.FogExp2(0x1e4a2a, 0.008);
    
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 5);
    camera.lookAt(0, 1.2, 0);
    
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
    mainLight.position.set(3, 5, 4);
    scene.add(mainLight);
    
    const fillLight = new THREE.PointLight(0xffaa66, 0.5);
    fillLight.position.set(0, 2, 3);
    scene.add(fillLight);
    
    const backLight = new THREE.PointLight(0x88aaff, 0.3);
    backLight.position.set(0, 2, -3);
    scene.add(backLight);
    
    pandaGroup = new THREE.Group();
    
    // Body (large, round)
    const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0;
    body.scale.set(1.1, 0.9, 0.9);
    pandaGroup.add(body);
    
    // Belly
    const bellyGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.4 });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.y = -0.1;
    belly.position.z = 0.7;
    belly.scale.set(0.9, 0.8, 0.6);
    pandaGroup.add(belly);
    
    // Head (big and round)
    const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.15;
    pandaGroup.add(head);
    
    // Black ears (large)
    const earGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const earMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
    
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.7, 1.75, 0);
    leftEar.scale.set(0.8, 0.9, 0.7);
    pandaGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.7, 1.75, 0);
    rightEar.scale.set(0.8, 0.9, 0.7);
    pandaGroup.add(rightEar);
    
    // Black eye patches (large, cute)
    const patchGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const patchMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    
    const leftPatch = new THREE.Mesh(patchGeo, patchMat);
    leftPatch.position.set(-0.55, 1.35, 0.85);
    leftPatch.scale.set(1.1, 0.9, 0.7);
    pandaGroup.add(leftPatch);
    
    const rightPatch = new THREE.Mesh(patchGeo, patchMat);
    rightPatch.position.set(0.55, 1.35, 0.85);
    rightPatch.scale.set(1.1, 0.9, 0.7);
    pandaGroup.add(rightPatch);
    
    // Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.55, 1.38, 1.1);
    pandaGroup.add(leftEyeWhite);
    
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeWhite.position.set(0.55, 1.38, 1.1);
    pandaGroup.add(rightEyeWhite);
    
    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.13, 32, 32);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.55, 1.36, 1.28);
    pandaGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.55, 1.36, 1.28);
    pandaGroup.add(rightPupil);
    
    // Nose
    const noseGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x2c1a0a, roughness: 0.2 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.1, 1.28);
    pandaGroup.add(nose);
    
    // Mouth (will animate)
    const mouthGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xff8888 });
    mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.98, 1.35);
    pandaGroup.add(mouth);
    
    scene.add(pandaGroup);
    
    // Floating animation
    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.002;
        pandaGroup.position.y = Math.sin(time) * 0.05;
        pandaGroup.rotation.z = Math.sin(time * 0.5) * 0.02;
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

function startSpeakingAnimation() {
    if (mouthAnimationInterval) return;
    mouthAnimationInterval = setInterval(() => {
        if (mouthOpen) {
            mouth.scale.set(1.3, 0.7, 1);
            mouthOpen = false;
        } else {
            mouth.scale.set(0.7, 1.2, 1);
            mouthOpen = true;
        }
    }, 120);
}

function stopSpeakingAnimation() {
    if (mouthAnimationInterval) {
        clearInterval(mouthAnimationInterval);
        mouthAnimationInterval = null;
    }
    mouth.scale.set(1, 1, 1);
    mouthOpen = false;
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
    recognition.onerror = () => {
        addMessage('assistant', '没听清，请再试一次～');
        updatePandaSpeech('没听清，可以再说一次吗？');
    };
}

function startSpeechInput() {
    if (recognition) {
        recognition.start();
    }
}

// ==================== Main Handler ====================
function handleUserInput(inputText) {
    if (!inputText.trim()) return;
    addMessage('user', inputText, true);
    userInput.value = '';
    processAnswer(inputText);
}

// ==================== Event Listeners ====================
sendBtn.addEventListener('click', () => handleUserInput(userInput.value));
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput(userInput.value);
});
speechBtn.addEventListener('click', startSpeechInput);

// ==================== Initialize ====================
window.addEventListener('load', () => {
    init3DPanda();
    initSpeechRecognition();
    startScene(0);
});