import * as THREE from 'three';

// ==================== 3D Panda Setup ====================
let scene, camera, renderer, pandaGroup, mouth;
let mouthOpen = false;
let mouthAnimationInterval = null;

// Demo scenes with scripts
const scenes = [
    {
        name: "✈️ 签证 · 机场场景",
        pandaLines: [
            { text: "你好！欢迎来到中国！请问你的签证准备好了吗？", duration: 4000, correction: false },
            { text: "请出示您的护照和签证～", duration: 3000, correction: false }
        ],
        userResponse: "👤 用户说：签证？我准备好了！",
        wrongExample: false
    },
    {
        name: "🗺️ 问路 · 校园场景",
        pandaLines: [
            { text: "同学你好！请问图书馆怎么走？我有点迷路了～", duration: 4000, correction: false },
            { text: "哇！谢谢你！你说得很清楚！", duration: 3000, correction: false }
        ],
        userResponse: "👤 用户说：直走，然后左转",
        wrongExample: false
    },
    {
        name: "🍜 点餐 · 食堂场景",
        pandaLines: [
            { text: "我想吃辣的，但不要太油～你能帮我和阿姨说吗？", duration: 4000, correction: false },
            { text: "太棒了！老板说马上就好！", duration: 3000, correction: false }
        ],
        userResponse: "👤 用户说：我要一份辣子鸡，少油",
        wrongExample: false
    },
    {
        name: "🛍️ 购物 · 退货场景",
        pandaLines: [
            { text: "哎呀，这双鞋尺码不对，穿不了……你知道怎么退货吗？", duration: 4500, correction: false },
            { text: "对对对！你说得很清楚！", duration: 3000, correction: false }
        ],
        userResponse: "👤 用户说：我要退货，因为尺码不合适",
        wrongExample: false
    },
    {
        name: "🏥 医院 · 挂号场景",
        pandaLines: [
            { text: "我肚子好疼……请问挂号处在哪儿？", duration: 4000, correction: false },
            { text: "谢谢！我现在知道了！", duration: 3000, correction: false }
        ],
        userResponse: "👤 用户说：挂号处在前面的左边",
        wrongExample: false
    }
];

// Add a speech correction demo scene
const correctionDemo = {
    name: "🗣️ 发音纠正演示",
    pandaLines: [
        { text: "用户说：我吃辣子鸡，不油", duration: 3000, correction: false },
        { text: "嗯？我没太听明白～可以再说一次吗？", duration: 3500, correction: false },
        { text: "💡 发音纠正提示：你可以说“辣子鸡”或“不油的辣菜”", duration: 4000, correction: true }
    ],
    userResponse: "👤 用户说：我吃辣子鸡，不油（发音不标准）",
    wrongExample: true
};

// Combine all scenes
const allScenes = [...scenes, correctionDemo];

let currentSceneIndex = 0;
let currentLineIndex = 0;
let isPlaying = false;
let currentTimeout = null;

// DOM Elements
const pandaSpeechSpan = document.getElementById('pandaSpeech');
const sceneTitleDiv = document.getElementById('sceneTitle');
const userResponseDiv = document.getElementById('userResponse');
const correctionHintDiv = document.getElementById('correctionHint');
const progressFill = document.getElementById('progressFill');

// ==================== 3D Panda ====================
function init3DPanda() {
    const canvas = document.getElementById('pandaCanvas');
    const container = document.querySelector('.panda-stage');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a4a2a);
    scene.fog = new THREE.FogExp2(0x1a4a2a, 0.008);
    
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
    
    pandaGroup = new THREE.Group();
    
    // Body
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
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.15;
    pandaGroup.add(head);
    
    // Ears
    const earGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const earMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.7, 1.75, 0);
    leftEar.scale.set(0.8, 0.9, 0.7);
    pandaGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.7, 1.75, 0);
    rightEar.scale.set(0.8, 0.9, 0.7);
    pandaGroup.add(rightEar);
    
    // Eye patches
    const patchGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const patchMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
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
    const leftEye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEye.position.set(-0.55, 1.38, 1.1);
    pandaGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEye.position.set(0.55, 1.38, 1.1);
    pandaGroup.add(rightEye);
    
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
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x2c1a0a });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.1, 1.28);
    pandaGroup.add(nose);
    
    // Mouth (for animation)
    const mouthGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xff8888 });
    mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.98, 1.35);
    pandaGroup.add(mouth);
    
    scene.add(pandaGroup);
    
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

function speakText(text, duration, callback) {
    pandaSpeechSpan.textContent = text;
    startSpeakingAnimation();
    
    // Optional: use speech synthesis for voice
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.onend = () => {
            stopSpeakingAnimation();
            if (callback) callback();
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        setTimeout(() => {
            stopSpeakingAnimation();
            if (callback) callback();
        }, duration);
    }
}

// ==================== Play Demo ====================
function playScene() {
    if (currentSceneIndex >= allScenes.length) {
        // Demo finished, loop back
        currentSceneIndex = 0;
        playScene();
        return;
    }
    
    const scene = allScenes[currentSceneIndex];
    sceneTitleDiv.textContent = scene.name;
    userResponseDiv.textContent = scene.userResponse;
    
    if (scene.wrongExample) {
        correctionHintDiv.textContent = "💡 发音纠正：试试说“辣子鸡”或“不油的辣菜”";
        correctionHintDiv.style.display = "block";
    } else {
        correctionHintDiv.textContent = "";
        correctionHintDiv.style.display = "block";
    }
    
    currentLineIndex = 0;
    playNextLine(scene);
}

function playNextLine(scene) {
    if (currentLineIndex >= scene.pandaLines.length) {
        // Scene finished, move to next
        currentSceneIndex++;
        setTimeout(() => {
            playScene();
        }, 1500);
        return;
    }
    
    const line = scene.pandaLines[currentLineIndex];
    pandaSpeechSpan.textContent = line.text;
    startSpeakingAnimation();
    
    // Update progress bar
    const totalScenes = allScenes.length;
    const totalLines = allScenes.reduce((sum, s) => sum + s.pandaLines.length, 0);
    let linesCompleted = 0;
    for (let i = 0; i < currentSceneIndex; i++) {
        linesCompleted += allScenes[i].pandaLines.length;
    }
    linesCompleted += currentLineIndex + 1;
    const progress = (linesCompleted / totalLines) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Speak with voice
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.onend = () => {
            stopSpeakingAnimation();
            currentLineIndex++;
            setTimeout(() => {
                playNextLine(scene);
            }, 800);
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        setTimeout(() => {
            stopSpeakingAnimation();
            currentLineIndex++;
            setTimeout(() => {
                playNextLine(scene);
            }, 800);
        }, line.duration);
    }
}

// ==================== Start ====================
window.addEventListener('load', () => {
    init3DPanda();
    setTimeout(() => {
        playScene();
    }, 1000);
});