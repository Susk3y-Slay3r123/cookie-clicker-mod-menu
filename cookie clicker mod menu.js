// ==UserScript==
// @name         Jayden's mod menu (Max Farms & Garden - No Give Seeds)
// @namespace    https://orteil.dashnet.org/cookieclicker/
// @version      5.23
// @description  Cookie Clicker mod menu: Hotkey: "/" to show/hide menu. Doge Mode, danger features, building amount/level setters, unlock all upgrades/achievements, instant cookies/lumps, and more!
// @author       Susk3y-Slay3r123 & DarkDeath & Copilot & Jayden
// @match        https://orteil.dashnet.org/cookieclicker/*
// @grant        none
// @run-at       document-idle
// @license MIT
// ==/UserScript==

(function() {
    function waitForGame(cb) {
        if (typeof Game !== 'undefined' && Game.ready && Game.UpgradesById && Game.ObjectsById) return cb();
        setTimeout(() => waitForGame(cb), 300);
    }

    waitForGame(initMenu);

    function initMenu() {
        let autoClickerOn = false, autoClickerInterval = null;
        let menuVisible = true;
        let dogeTextActive = false;
        let dogeTextTimers = [];
        let menuFading = false;
        let currentHotkey = localStorage.getItem('cc-menu-hotkey') || '/';
        let currentMenuColor = localStorage.getItem('cc-menu-color') || '#00FFCC';
        let particlesPool = [];
        const MAX_PARTICLES = 200;

        // PERMANENT BLOCK: Prevent "cheated cookies taste awful" achievement EVERYWHERE
        let originalWin = Game.Win;
        Game.Win = function(achievement) {
            const forbiddenAchievements = [
                "cheated cookies taste awful",
                "cheated cookies taste awful.",
                "cheater"
            ];
            if (typeof achievement === 'string' && forbiddenAchievements.some(bad => achievement.toLowerCase().includes(bad.toLowerCase()))) {
                console.log('Blocked achievement: ' + achievement);
                return;
            }
            return originalWin.call(this, achievement);
        };

        let originalLock = Game.Lock;
        if (originalLock) {
            Game.Lock = function(achievement) {
                const forbiddenAchievements = [
                    "cheated cookies taste awful",
                    "cheated cookies taste awful.",
                    "cheater"
                ];
                if (typeof achievement === 'string' && forbiddenAchievements.some(bad => achievement.toLowerCase().includes(bad.toLowerCase()))) {
                    console.log('Blocked lock attempt: ' + achievement);
                    return;
                }
                return originalLock.call(this, achievement);
            };
        }

        setTimeout(() => {
            Object.values(Game.AchievementsById).forEach(a => {
                const forbiddenAchievements = [
                    "cheated cookies taste awful",
                    "cheated cookies taste awful.",
                    "cheater"
                ];
                if (typeof a.name === "string" && forbiddenAchievements.some(bad => a.name.toLowerCase().includes(bad.toLowerCase()))) {
                    a.won = 0;
                    a.unlocked = 0;
                    a.progress = 0;
                    console.log('Permanently disabled: ' + a.name);
                }
            });
        }, 1000);

        setInterval(() => {
            Object.values(Game.AchievementsById).forEach(a => {
                const forbiddenAchievements = [
                    "cheated cookies taste awful",
                    "cheated cookies taste awful.",
                    "cheater"
                ];
                if (typeof a.name === "string" && forbiddenAchievements.some(bad => a.name.toLowerCase().includes(bad.toLowerCase()))) {
                    if (a.won !== 0 || a.unlocked !== 0) {
                        a.won = 0;
                        a.unlocked = 0;
                        a.progress = 0;
                        console.log('Reverted cheated achievement unlock');
                    }
                }
            });
        }, 500);

        // Insert styles with will-change and GPU acceleration
        const style = document.createElement('style');
        style.textContent = `
            /* Welcome Screen Styles */
            .welcome-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 9999999;
                display: flex;
                justify-content: center;
                align-items: center;
                pointer-events: auto;
                animation: overlay-fade-in 0.6s ease-out forwards;
            }
            @keyframes overlay-fade-in {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
            .welcome-screen {
                background: linear-gradient(135deg, rgba(0, 20, 40, 0.98) 0%, rgba(10, 10, 30, 0.98) 100%);
                border: 3px solid #00FFCC;
                border-radius: 20px;
                padding: 50px;
                text-align: center;
                max-width: 600px;
                box-shadow: 0 0 60px #00FFCC, 0 0 100px rgba(0, 255, 204, 0.3), inset 0 0 30px rgba(0, 255, 204, 0.1);
                animation: welcome-pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes welcome-pop-in {
                0% {
                    opacity: 0;
                    transform: scale(0.3) rotate(-45deg);
                }
                50% {
                    transform: scale(1.05) rotate(5deg);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
            }
            .welcome-title {
                font-size: 48px;
                color: #00FFCC;
                margin-bottom: 20px;
                text-shadow: 0 0 20px #00FFCC, 0 0 40px rgba(0, 255, 204, 0.5);
                font-weight: bold;
                animation: title-glow 2s ease-in-out infinite;
            }
            @keyframes title-glow {
                0%, 100% {
                    text-shadow: 0 0 20px #00FFCC, 0 0 40px rgba(0, 255, 204, 0.5);
                }
                50% {
                    text-shadow: 0 0 30px #00FFCC, 0 0 60px rgba(0, 255, 204, 0.8), 0 0 10px #FFD700;
                }
            }
            .welcome-message {
                font-size: 28px;
                color: #FFD700;
                line-height: 1.6;
                margin: 30px 0;
                text-shadow: 0 0 10px #FFD700, 0 0 20px rgba(255, 215, 0, 0.5);
                font-weight: 500;
            }
            .welcome-author {
                font-size: 32px;
                color: #00FFFF;
                margin: 20px 0;
                text-shadow: 0 0 15px #00FFFF, 0 0 25px rgba(0, 255, 255, 0.6);
                font-style: italic;
                font-weight: bold;
            }
            .welcome-button {
                background: linear-gradient(135deg, #00FFCC 0%, #00FFFF 100%);
                color: #000;
                border: none;
                padding: 18px 60px;
                font-size: 24px;
                border-radius: 12px;
                cursor: pointer;
                margin-top: 40px;
                font-weight: bold;
                transition: all 0.4s ease;
                box-shadow: 0 0 30px #00FFCC, 0 0 60px rgba(0, 255, 204, 0.4);
                text-transform: uppercase;
                letter-spacing: 2px;
                will-change: transform, box-shadow;
                transform: translateZ(0);
            }
            .welcome-button:hover {
                transform: scale(1.08) translateY(-3px) translateZ(0);
                box-shadow: 0 0 50px #00FFCC, 0 0 100px rgba(0, 255, 204, 0.6), 0 0 30px #FFD700;
            }
            .welcome-button:active {
                animation: button-click 0.3s ease-out;
            }
            @keyframes button-click {
                0% {
                    transform: scale(1.08) translateY(-3px) translateZ(0);
                }
                50% {
                    transform: scale(0.98) translateY(0px) translateZ(0);
                }
                100% {
                    transform: scale(1) translateY(0px) translateZ(0);
                }
            }
            .welcome-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            .welcome-particle {
                position: absolute;
                border-radius: 50%;
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .particle-float {
                animation: particle-float 3s ease-in-out infinite;
            }
            @keyframes particle-float {
                0%, 100% {
                    opacity: 0;
                    transform: translateY(0) scale(0) translateZ(0);
                }
                50% {
                    opacity: 1;
                    transform: translateY(-80px) scale(1) translateZ(0);
                }
            }

            #cookie-clicker-menu {
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.92);
                color: white;
                border: 1.5px solid var(--menu-color, #00FFCC);
                padding: 0;
                z-index: 1000000;
                font-family: Arial, sans-serif;
                width: 280px;
                border-radius: 12px;
                box-shadow: 0 0 20px var(--menu-color, #00FFCC), 0 0 40px var(--menu-color-alpha, #00FFCC80), inset 0 0 10px var(--menu-color-inset, #00FFCC40);
                display: block;
                will-change: transform;
                backface-visibility: hidden;
            }
            #cookie-clicker-menu.load-animation {
                animation: menu-load-epic 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes menu-load-epic {
                0% {
                    opacity: 0;
                    transform: translate(500px, -500px) scale(0) rotate(-360deg) translateZ(0);
                    box-shadow: 0 0 0px var(--menu-color, #00FFCC), inset 0 0 0px var(--menu-color, #00FFCC);
                }
                15% {
                    box-shadow: 0 0 80px var(--menu-color, #00FFCC), 0 0 160px var(--menu-color, #00FFCC), inset 0 0 40px var(--menu-color, #00FFCC);
                }
                30% {
                    transform: translate(250px, -250px) scale(0.3) rotate(-180deg) translateZ(0);
                    opacity: 0.7;
                }
                50% {
                    transform: translate(100px, -100px) scale(0.7) rotate(-90deg) translateZ(0);
                    box-shadow: 0 0 60px var(--menu-color, #00FFCC), 0 0 120px var(--menu-color, #00FFCC), inset 0 0 30px var(--menu-color, #00FFCC);
                }
                75% {
                    transform: translate(20px, -20px) scale(0.95) rotate(-20deg) translateZ(0);
                    opacity: 1;
                }
                90% {
                    box-shadow: 0 0 30px var(--menu-color, #00FFCC), 0 0 60px var(--menu-color, #00FFCC), inset 0 0 15px var(--menu-color, #00FFCC);
                    transform: translate(5px, -5px) scale(1) rotate(-5deg) translateZ(0);
                }
                100% {
                    opacity: 1;
                    transform: translate(0px, 0px) scale(1) rotate(0deg) translateZ(0);
                    box-shadow: 0 0 20px var(--menu-color, #00FFCC), 0 0 40px var(--menu-color-alpha, #00FFCC80), inset 0 0 10px var(--menu-color-inset, #00FFCC40);
                }
            }
            #cookie-clicker-menu.fade-out {
                animation: menu-fade-out 0.8s ease-in forwards !important;
            }
            @keyframes menu-fade-out {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
            #cookie-clicker-menu.fade-in {
                animation: menu-fade-in 0.8s ease-out forwards !important;
            }
            @keyframes menu-fade-in {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
            #cookie-clicker-menu .menu-title {
                margin: 0;
                padding: 7px 10px;
                cursor: move;
                user-select: none;
                border-bottom: 1px solid #FFD700;
                background: #222;
                font-size: 15px;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-height: 32px;
            }
            #cookie-clicker-menu .menu-content {
                padding: 9px;
                display: block;
                max-height: 95vh;
                height: auto;
                overflow-y: auto;
            }
            #cookie-clicker-menu label, #cookie-clicker-menu input {
                vertical-align: middle;
                font-size: 13px;
            }
            #cookie-clicker-menu button {
                display: block;
                width: 100%;
                margin-bottom: 7px;
                padding: 5px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.3s;
                font-size: 13px;
                position: relative;
                overflow: hidden;
                will-change: transform, box-shadow;
                transform: translateZ(0);
            }
            #cookie-clicker-menu button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.2);
                transition: left 0.5s ease;
                z-index: 0;
            }
            #cookie-clicker-menu button:hover::before {
                left: 100%;
            }
            #cookie-clicker-menu button:active {
                animation: button-pulse 0.4s ease-out;
            }
            @keyframes button-pulse {
                0% {
                    transform: scale(1) translateZ(0);
                    box-shadow: 0 0 0px rgba(0, 255, 204, 0);
                }
                50% {
                    transform: scale(0.98) translateZ(0);
                    box-shadow: 0 0 15px rgba(0, 255, 204, 0.6);
                }
                100% {
                    transform: scale(1) translateZ(0);
                    box-shadow: 0 0 0px rgba(0, 255, 204, 0);
                }
            }
            #cookie-clicker-menu button:hover {
                background-color: #0056b3;
                transform: translateY(-2px) translateZ(0);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            #cookie-clicker-menu button span {
                position: relative;
                z-index: 1;
            }
            #cookie-clicker-menu .danger-btn {
                background-color: #dc3545 !important;
            }
            #cookie-clicker-menu .danger-btn:hover {
                background-color: #c82333 !important;
            }
            #cookie-clicker-menu .danger-btn2 {
                background-color: #a900e3 !important;
                color: #fff !important;
            }
            #cookie-clicker-menu .danger-btn2:hover {
                background-color: #7900ac !important;
            }
            #cookie-clicker-menu .close-btn {
                background: #333;
                color: #FFD700;
            }
            #cookie-clicker-menu .section-title {
                color: #FFD700;
                margin-top: 8px;
                margin-bottom: 2px;
                font-weight: bold;
                font-size: 13px;
                animation: title-shimmer 3s ease-in-out infinite;
            }
            @keyframes title-shimmer {
                0%, 100% {
                    text-shadow: 0 0 0px #FFD700;
                }
                50% {
                    text-shadow: 0 0 10px #FFD700, 0 0 20px rgba(255, 215, 0, 0.5);
                }
            }
            #cookie-clicker-menu input[type='number'] {
                width: 75px;
                padding: 2px 4px;
                background: #444;
                color: #fff;
                border: 1px solid #333;
                border-radius: 4px;
                margin-right: 5px;
                font-size: 13px;
                transition: all 0.3s;
            }
            #cookie-clicker-menu input[type='number']:focus {
                border-color: var(--menu-color, #00FFCC);
                box-shadow: 0 0 10px var(--menu-color, #00FFCC);
                background: #333;
            }
            #cookie-clicker-menu input[type='text'] {
                width: 90%;
                padding: 2px 4px;
                background: #444;
                color: #fff;
                border: 1px solid #333;
                border-radius: 4px;
                margin: 5px 0;
                font-size: 13px;
                box-sizing: border-box;
                transition: all 0.3s;
            }
            #cookie-clicker-menu input[type='text']:focus {
                border-color: var(--menu-color, #00FFCC);
                box-shadow: 0 0 10px var(--menu-color, #00FFCC);
                background: #333;
            }
            .color-button {
                display: inline-block;
                width: 35px;
                height: 35px;
                margin: 5px 2px;
                border: 2px solid #fff;
                border-radius: 5px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.3s;
                animation: color-button-idle 2s ease-in-out infinite;
                will-change: transform;
                transform: translateZ(0);
            }
            @keyframes color-button-idle {
                0%, 100% {
                    transform: scale(1) translateY(0) translateZ(0);
                }
                50% {
                    transform: scale(1.05) translateY(-3px) translateZ(0);
                }
            }
            .color-button:hover {
                transform: scale(1.15) translateY(-5px) translateZ(0);
                box-shadow: 0 0 20px currentColor, 0 5px 15px rgba(0, 0, 0, 0.3);
                animation: none;
            }
            .color-button:active {
                animation: color-button-click 0.3s ease-out;
            }
            @keyframes color-button-click {
                0% {
                    transform: scale(0.95) translateZ(0);
                }
                50% {
                    transform: scale(1.1) translateZ(0);
                }
                100% {
                    transform: scale(1) translateZ(0);
                }
            }
            .color-buttons-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                margin: 8px 0;
            }
            #cc-custom-color-input {
                width: 100%;
                padding: 6px;
                background: #444;
                color: #FFD700;
                border: 1px solid #FFD700;
                border-radius: 4px;
                margin: 8px 0;
                box-sizing: border-box;
                font-size: 12px;
                transition: all 0.3s;
            }
            #cc-custom-color-input:focus {
                box-shadow: 0 0 15px #FFD700, inset 0 0 5px rgba(255, 215, 0, 0.3);
                background: #333;
            }
            .custom-window {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0,0,0,0.97);
                color: white;
                border: 2px solid #FFD700;
                padding: 15px;
                z-index: 1000001;
                font-family: Arial, sans-serif;
                width: 250px;
                text-align: center;
                border-radius: 14px;
                box-shadow: 0 0 20px #000c;
                animation: popup-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                will-change: transform, opacity;
                transform: translate(-50%, -50%) translateZ(0);
            }
            @keyframes popup-appear {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5) rotate(-20deg) translateZ(0);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1) rotate(0deg) translateZ(0);
                }
            }
            .custom-window input, .custom-window textarea {
                width: 92%;
                padding: 5px;
                margin: 6px 0;
                box-sizing: border-box;
                background: #333;
                color: #FFD700;
                border-radius: 6px;
                border: 1px solid #FFD700;
                font-size: 14px;
                transition: all 0.3s;
            }
            .custom-window input:focus, .custom-window textarea:focus {
                box-shadow: 0 0 15px #FFD700;
                background: #222;
            }
            .custom-window textarea {
                resize: vertical;
                min-height: 48px;
                max-height: 120px;
            }
            .custom-window button {
                margin: 6px;
                padding: 6px 12px;
                background-color: #FFD700;
                color: #222;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                font-size: 13px;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
                will-change: transform, box-shadow;
                transform: translateZ(0);
            }
            .custom-window button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.3);
                transition: left 0.4s ease;
                z-index: 0;
            }
            .custom-window button:hover::before {
                left: 100%;
            }
            .custom-window button:hover {
                background-color: #ffe666;
                transform: translateY(-2px) translateZ(0);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            .custom-window button:active {
                transform: translateY(0px) translateZ(0);
            }
            .custom-window button span {
                position: relative;
                z-index: 1;
            }
            .custom-window h4 {
                margin-bottom: 6px;
                font-size: 15px;
                animation: title-pulse 1.5s ease-in-out infinite;
            }
            @keyframes title-pulse {
                0%, 100% {
                    text-shadow: 0 0 5px #FFD700;
                }
                50% {
                    text-shadow: 0 0 15px #FFD700, 0 0 25px rgba(255, 215, 0, 0.5);
                }
            }
            .doge-float {
                position: fixed;
                z-index: 999999;
                font-family: Comic Sans MS, Comic Sans, cursive;
                font-weight: bold;
                font-size: 2em;
                pointer-events:none;
                user-select:none;
                text-shadow: 2px 2px 8px #000, 0 0 4px #FFD700;
                animation: doge-float-move 2.5s linear forwards;
                will-change: transform, opacity;
                transform: translateZ(0);
            }
            @keyframes doge-float-move {
                0% { opacity: 0; transform: translateY(40px) scale(0.7) translateZ(0);}
                20% {opacity:1;}
                90% {opacity:1;}
                100% { opacity: 0; transform: translateY(-80px) scale(1) translateZ(0);}
            }
            /* Load Animation Particles */
            .load-particle {
                position: fixed;
                pointer-events: none;
                z-index: 999998;
                border-radius: 50%;
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .load-particle-animate {
                animation: load-particle-move 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes load-particle-move {
                0% {
                    opacity: 1;
                    transform: translate(var(--start-x), var(--start-y)) scale(1) translateZ(0);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--end-x), var(--end-y)) scale(0) translateZ(0);
                }
            }
            /* Load Portal Effect */
            .load-portal {
                position: fixed;
                z-index: 999997;
                border-radius: 50%;
                pointer-events: none;
                will-change: transform, box-shadow;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .load-portal-animate {
                animation: load-portal-spin 2.5s ease-out forwards;
            }
            @keyframes load-portal-spin {
                0% {
                    opacity: 0;
                    transform: translate(var(--portal-x), var(--portal-y)) scale(0) rotate(0deg) translateZ(0);
                    box-shadow: 0 0 0px var(--menu-color, #00FFCC);
                }
                20% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.8;
                    box-shadow: 0 0 80px var(--menu-color, #00FFCC), 0 0 160px var(--menu-color, #00FFCC);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--portal-x), var(--portal-y)) scale(2) rotate(720deg) translateZ(0);
                    box-shadow: 0 0 0px var(--menu-color, #00FFCC);
                }
            }
            /* Load Screen Flash */
            .load-flash {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999996;
                pointer-events: none;
            }
            .load-flash-animate {
                animation: load-flash-pulse 2.5s ease-out forwards;
            }
            @keyframes load-flash-pulse {
                0% {
                    opacity: 0;
                    background: transparent;
                }
                15% {
                    opacity: 0.3;
                    background: radial-gradient(circle at 20% 80%, var(--menu-color, #00FFCC), transparent);
                }
                30% {
                    opacity: 0.2;
                    background: radial-gradient(circle at 20% 80%, var(--menu-color, #00FFCC), transparent);
                }
                50% {
                    opacity: 0.1;
                }
                100% {
                    opacity: 0;
                    background: transparent;
                }
            }
            /* EXPLOSION OUTWARD PARTICLES */
            .particle-explosion-out {
                position: fixed;
                pointer-events: none;
                border-radius: 50%;
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .explosion-out-anim {
                animation: explosion-outward 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }
            @keyframes explosion-outward {
                0% {
                    opacity: 1;
                    transform: scale(1) translate(0, 0) translateZ(0);
                }
                50% {
                    opacity: 0.8;
                }
                100% {
                    opacity: 0;
                    transform: scale(0) translate(var(--exp-out-x), var(--exp-out-y)) translateZ(0);
                }
            }
            /* EXPLOSION INWARD PARTICLES - REVERSE */
            .particle-explosion-in {
                position: fixed;
                pointer-events: none;
                border-radius: 50%;
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .explosion-in-anim {
                animation: explosion-inward 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }
            @keyframes explosion-inward {
                0% {
                    opacity: 0;
                    transform: scale(0) translate(var(--exp-in-x), var(--exp-in-y)) translateZ(0);
                }
                50% {
                    opacity: 0.8;
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translate(0, 0) translateZ(0);
                }
            }
            /* GLOW EFFECT */
            .glow-effect {
                position: fixed;
                pointer-events: none;
                border-radius: 50%;
                will-change: transform, opacity, box-shadow;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .glow-out {
                animation: glow-expand 1.5s ease-out forwards;
            }
            @keyframes glow-expand {
                0% {
                    opacity: 1;
                    transform: scale(0.5) translateZ(0);
                    box-shadow: 0 0 30px var(--glow-col, #00FFCC);
                }
                100% {
                    opacity: 0;
                    transform: scale(6) translateZ(0);
                    box-shadow: 0 0 0px var(--glow-col, #00FFCC);
                }
            }
            .glow-in {
                animation: glow-contract 1.5s ease-out forwards;
            }
            @keyframes glow-contract {
                0% {
                    opacity: 0;
                    transform: scale(6) translateZ(0);
                    box-shadow: 0 0 0px var(--glow-col, #00FFCC);
                }
                100% {
                    opacity: 1;
                    transform: scale(0.5) translateZ(0);
                    box-shadow: 0 0 30px var(--glow-col, #00FFCC);
                }
            }
            /* RIPPLE WAVES */
            .ripple-wave {
                position: fixed;
                pointer-events: none;
                border: 2px solid var(--ripple-color, #00FFCC);
                border-radius: 50%;
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .ripple-out-anim {
                animation: ripple-expand 1.5s ease-out forwards;
            }
            @keyframes ripple-expand {
                0% {
                    opacity: 1;
                    transform: scale(0.2) translateZ(0);
                    box-shadow: 0 0 20px var(--ripple-color, #00FFCC);
                }
                50% {
                    opacity: 0.6;
                    box-shadow: 0 0 40px var(--ripple-color, #00FFCC);
                }
                100% {
                    opacity: 0;
                    transform: scale(5) translateZ(0);
                    box-shadow: 0 0 0px var(--ripple-color, #00FFCC);
                }
            }
            .ripple-in-anim {
                animation: ripple-contract 1.5s ease-out forwards;
            }
            @keyframes ripple-contract {
                0% {
                    opacity: 0;
                    transform: scale(5) translateZ(0);
                    box-shadow: 0 0 0px var(--ripple-color, #00FFCC);
                }
                50% {
                    opacity: 0.6;
                    box-shadow: 0 0 40px var(--ripple-color, #00FFCC);
                }
                100% {
                    opacity: 1;
                    transform: scale(0.2) translateZ(0);
                    box-shadow: 0 0 20px var(--ripple-color, #00FFCC);
                }
            }
            .remove-achievement-btn {
                background-color: #ff6b35 !important;
            }
            .remove-achievement-btn:hover {
                background-color: #e55a24 !important;
            }
        `;
        document.head.appendChild(style);

        // Show Welcome Screen
        function showWelcomeScreen() {
            const overlay = document.createElement('div');
            overlay.className = 'welcome-overlay';
            
            const welcomeScreen = document.createElement('div');
            welcomeScreen.className = 'welcome-screen';
            
            // Create particles container
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'welcome-particles';
            
            // Create floating particles
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.className = 'welcome-particle particle-float';
                const size = Math.random() * 8 + 3;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.background = ['#00FFCC', '#FFD700', '#00FFFF', '#FF1493'][Math.floor(Math.random() * 4)];
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.background}`;
                particle.style.animationDelay = (Math.random() * 2) + 's';
                particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
                particlesContainer.appendChild(particle);
            }
            
            welcomeScreen.appendChild(particlesContainer);
            
            const title = document.createElement('div');
            title.className = 'welcome-title';
            title.textContent = '🍪 JAYDEN\'S MOD MENU 🍪';
            welcomeScreen.appendChild(title);
            
            const message = document.createElement('div');
            message.className = 'welcome-message';
            message.innerHTML = 'This mod is made by<br><span class="welcome-author">Jayden Garza</span><br>Hope you enjoy my mod!<br>Due to how long it took me to make :P';
            welcomeScreen.appendChild(message);
            
            const button = document.createElement('button');
            button.className = 'welcome-button';
            button.textContent = 'CONTINUE ➔';
            button.onclick = function() {
                // Remove welcome screen with fade out
                overlay.style.animation = 'overlay-fade-out 0.6s ease-in forwards';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    // Now show the menu
                    initializeMenu();
                }, 600);
            };
            welcomeScreen.appendChild(button);
            
            overlay.appendChild(welcomeScreen);
            document.body.appendChild(overlay);
        }

        // Add fade out animation
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes overlay-fade-out {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(fadeOutStyle);

        // Initialize Menu
        function initializeMenu() {
            // Build menu HTML
            const menu = document.createElement('div');
            menu.id = 'cookie-clicker-menu';
            menu.style.setProperty('--menu-color', currentMenuColor);
            menu.style.setProperty('--menu-color-alpha', currentMenuColor + '80');
            menu.style.setProperty('--menu-color-inset', currentMenuColor + '40');
            menu.innerHTML = `
                <div class="menu-title">
                    <span>🍪 Jayden's Mod Menu</span>
                </div>
                <div class="menu-content">
                    <div class="section-title">Building Editors</div>
                    <label for="cc-product-level-input">Set Product Level (All):</label>
                    <input type="number" min="0" max="999" value="0" id="cc-product-level-input" style="width:75px;">
                    <button id="cc-set-product-level-btn" type="button"><span>Set Product Level</span></button>
                    <label for="cc-building-amount-input">Set Building Amount (All except Cursor):</label>
                    <input type="number" min="0" max="999999" value="0" id="cc-building-amount-input" style="width:75px;">
                    <button id="cc-set-building-amount-btn" type="button"><span>Set Building Amount</span></button>
                    <div class="section-title">Cookies & Lumps</div>
                    <label>Add cookies:</label>
                    <input type="number" id="cc-add-cookies" placeholder="Amount">
                    <button id="cc-add-cookies-btn" type="button"><span>Add Cookies</span></button>
                    <label>Add sugar lumps:</label>
                    <input type="number" id="cc-add-lumps" placeholder="Amount">
                    <button id="cc-add-lumps-btn" type="button"><span>Add Lumps</span></button>
                    <button id="cc-remove-cookies-btn" type="button"><span>Remove All Cookies</span></button>
                    <div class="section-title">Auto Clicker</div>
                    <button id="cc-auto-clicker-btn" type="button"><span>Start Auto-Clicker</span></button>
                    <div class="section-title">Upgrades & Achievements</div>
                    <button id="cc-unlock-upgrades-btn" type="button"><span>Unlock All Upgrades</span></button>
                    <button id="cc-unlock-achievements-btn" type="button"><span>Unlock All Achievements</span></button>
                    <button class="remove-achievement-btn" id="cc-remove-cheated-btn" type="button"><span>Remove "Cheated" Achievement</span></button>
                    <div class="section-title">Game Speed</div>
                    <label for="cc-fps-input">FPS:</label>
                    <input type="number" min="1" max="999999" value="30" id="cc-fps-input" style="width:75px;">
                    <button id="cc-set-fps-btn" type="button"><span>Set FPS</span></button>
                    <span style="font-size:12px;">Current FPS: <span id="cc-fps-value">30</span></span>
                    <div class="section-title">Custom Notification</div>
                    <button id="cc-custom-notification-btn" type="button"><span>Show Custom Notification</span></button>
                    <div class="section-title">Menu Color</div>
                    <div class="color-buttons-container">
                        <button class="color-button" style="background-color: #00FFCC;" id="cc-color-cyan" title="Cyan"></button>
                        <button class="color-button" style="background-color: #FFD700;" id="cc-color-gold" title="Gold"></button>
                        <button class="color-button" style="background-color: #FF1493;" id="cc-color-pink" title="Hot Pink"></button>
                        <button class="color-button" style="background-color: #00FF00;" id="cc-color-green" title="Lime Green"></button>
                        <button class="color-button" style="background-color: #FF6347;" id="cc-color-red" title="Tomato Red"></button>
                        <button class="color-button" style="background-color: #9D00FF;" id="cc-color-purple" title="Purple"></button>
                        <button class="color-button" style="background-color: #00FFFF;" id="cc-color-aqua" title="Aqua"></button>
                        <button class="color-button" style="background-color: #FF00FF;" id="cc-color-magenta" title="Magenta"></button>
                    </div>
                    <input type="text" id="cc-custom-color-input" placeholder="Enter hex color (e.g., #FF00FF)" maxlength="7">
                    <button id="cc-apply-custom-color-btn" type="button"><span>Apply Custom Color</span></button>
                    <div class="section-title">Fun Features</div>
                    <button id="cc-doge-mode-btn" type="button"><span>Doge Mode</span></button>
                    <div class="section-title">Hotkey Settings</div>
                    <button id="cc-change-hotkey-btn" type="button"><span>Change Hotkey (Current: <span id="cc-hotkey-display">/</span>)</span></button>
                    <div class="section-title">Danger Zone</div>
                    <button class="danger-btn" id="cc-ruin-btn" type="button"><span>Ruin the Fun</span></button>
                    <button class="danger-btn2" id="cc-break-game-btn" type="button"><span>Break Game (999... Cursors)</span></button>
                    <button class="close-btn" id="cc-close-btn" type="button"><span>Close Menu</span></button>
                    <div style="font-size:11px;color:#FFD700;margin-top:8px;">Press "<span id="cc-hotkey-display-footer">/</span>" to toggle this menu!</div>
                </div>
            `;
            document.body.appendChild(menu);

            // Play initial load animation
            menu.classList.add('load-animation');
            createLoadAnimation();

            // Remove load animation class after it completes
            setTimeout(() => {
                menu.classList.remove('load-animation');
            }, 2500);

            // Update hotkey display on load
            document.getElementById('cc-hotkey-display').textContent = currentHotkey;
            document.getElementById('cc-hotkey-display-footer').textContent = currentHotkey;

            // Initial Load Animation Effect (Optimized)
            function createLoadAnimation() {
                const menuRect = menu.getBoundingClientRect();
                const centerX = menuRect.left + menuRect.width / 2;
                const centerY = menuRect.top + menuRect.height / 2;

                // Full screen flash
                const flash = document.createElement('div');
                flash.className = 'load-flash load-flash-animate';
                flash.style.setProperty('--menu-color', currentMenuColor);
                document.body.appendChild(flash);
                setTimeout(() => {
                    if (flash.parentNode) flash.parentNode.removeChild(flash);
                }, 2500);

                // Multiple portal rings
                for (let portalIdx = 0; portalIdx < 5; portalIdx++) {
                    setTimeout(() => {
                        const portal = document.createElement('div');
                        portal.className = 'load-portal load-portal-animate';
                        const portalSize = 60 + portalIdx * 50;
                        portal.style.width = portalSize + 'px';
                        portal.style.height = portalSize + 'px';
                        portal.style.border = `3px solid ${currentMenuColor}`;
                        portal.style.left = (centerX - portalSize / 2) + 'px';
                        portal.style.top = (centerY - portalSize / 2) + 'px';
                        portal.style.setProperty('--portal-x', '0px');
                        portal.style.setProperty('--portal-y', '0px');
                        portal.style.setProperty('--menu-color', currentMenuColor);
                        document.body.appendChild(portal);
                        setTimeout(() => {
                            if (portal.parentNode) portal.parentNode.removeChild(portal);
                        }, 2500);
                    }, portalIdx * 200);
                }

                // Incoming particles from edges
                const incomingParticles = 50;
                for (let i = 0; i < incomingParticles; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'load-particle load-particle-animate';
                    
                    const size = Math.random() * 12 + 2;
                    particle.style.width = size + 'px';
                    particle.style.height = size + 'px';
                    
                    const colors = [currentMenuColor, '#FFD700', '#FF1493', '#00FFFF', '#00FF00'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.backgroundColor = color;
                    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
                    
                    let startX, startY;
                    const edge = Math.random() * 4;
                    if (edge < 1) {
                        startX = Math.random() * window.innerWidth;
                        startY = -100;
                    } else if (edge < 2) {
                        startX = window.innerWidth + 100;
                        startY = Math.random() * window.innerHeight;
                    } else if (edge < 3) {
                        startX = Math.random() * window.innerWidth;
                        startY = window.innerHeight + 100;
                    } else {
                        startX = -100;
                        startY = Math.random() * window.innerHeight;
                    }
                    
                    particle.style.left = startX + 'px';
                    particle.style.top = startY + 'px';
                    
                    const distX = centerX - startX;
                    const distY = centerY - startY;
                    
                    particle.style.setProperty('--start-x', '0px');
                    particle.style.setProperty('--start-y', '0px');
                    particle.style.setProperty('--end-x', distX + 'px');
                    particle.style.setProperty('--end-y', distY + 'px');
                    
                    document.body.appendChild(particle);
                    
                    setTimeout(() => {
                        if (particle.parentNode) particle.parentNode.removeChild(particle);
                    }, 2500);
                }

                // Spiral converging particles
                const spiralParticles = 25;
                for (let i = 0; i < spiralParticles; i++) {
                    setTimeout(() => {
                        const spiralParticle = document.createElement('div');
                        spiralParticle.className = 'load-particle load-particle-animate';
                        
                        const size = Math.random() * 10 + 3;
                        spiralParticle.style.width = size + 'px';
                        spiralParticle.style.height = size + 'px';
                        
                        spiralParticle.style.backgroundColor = currentMenuColor;
                        spiralParticle.style.boxShadow = `0 0 ${size * 2}px ${currentMenuColor}`;
                        
                        const angle = (i / spiralParticles) * Math.PI * 2;
                        const distance = 400;
                        const startX = centerX + Math.cos(angle) * distance;
                        const startY = centerY + Math.sin(angle) * distance;
                        
                        spiralParticle.style.left = startX + 'px';
                        spiralParticle.style.top = startY + 'px';
                        
                        spiralParticle.style.setProperty('--start-x', '0px');
                        spiralParticle.style.setProperty('--start-y', '0px');
                        spiralParticle.style.setProperty('--end-x', (centerX - startX) + 'px');
                        spiralParticle.style.setProperty('--end-y', (centerY - startY) + 'px');
                        
                        document.body.appendChild(spiralParticle);
                        
                        setTimeout(() => {
                            if (spiralParticle.parentNode) spiralParticle.parentNode.removeChild(spiralParticle);
                        }, 2500);
                    }, i * 30);
                }
            }

            // Function to update menu color
            function updateMenuColor(color) {
                currentMenuColor = color;
                localStorage.setItem('cc-menu-color', color);
                menu.style.setProperty('--menu-color', color);
                menu.style.setProperty('--menu-color-alpha', color + '80');
                menu.style.setProperty('--menu-color-inset', color + '40');
            }

            // Color button event listeners
            document.getElementById('cc-color-cyan').onclick = () => updateMenuColor('#00FFCC');
            document.getElementById('cc-color-gold').onclick = () => updateMenuColor('#FFD700');
            document.getElementById('cc-color-pink').onclick = () => updateMenuColor('#FF1493');
            document.getElementById('cc-color-green').onclick = () => updateMenuColor('#00FF00');
            document.getElementById('cc-color-red').onclick = () => updateMenuColor('#FF6347');
            document.getElementById('cc-color-purple').onclick = () => updateMenuColor('#9D00FF');
            document.getElementById('cc-color-aqua').onclick = () => updateMenuColor('#00FFFF');
            document.getElementById('cc-color-magenta').onclick = () => updateMenuColor('#FF00FF');

            // Custom color input
            document.getElementById('cc-apply-custom-color-btn').onclick = function() {
                let customColor = document.getElementById('cc-custom-color-input').value.trim();
                if (/^#[0-9A-F]{6}$/i.test(customColor)) {
                    updateMenuColor(customColor);
                    createAlertWindow(`Menu color changed to ${customColor}!`, 'Color Updated');
                } else {
                    createAlertWindow('Please enter a valid hex color code (e.g., #FF00FF)', 'Invalid Color');
                }
            };

            // EXPLOSION OUTWARD - DISAPPEAR ANIMATION WITH RIPPLES
            function createExplosionOutEffect() {
                const menuRect = menu.getBoundingClientRect();
                const centerX = menuRect.left + menuRect.width / 2;
                const centerY = menuRect.top + menuRect.height / 2;

                // Glow effect
                const glow = document.createElement('div');
                glow.className = 'glow-effect glow-out';
                glow.style.width = '50px';
                glow.style.height = '50px';
                glow.style.left = (centerX - 25) + 'px';
                glow.style.top = (centerY - 25) + 'px';
                glow.style.setProperty('--glow-col', currentMenuColor);
                glow.style.backgroundColor = currentMenuColor;
                document.body.appendChild(glow);

                // CREATE RIPPLES OUTWARD
                const rippleCount = 3;
                for (let r = 0; r < rippleCount; r++) {
                    setTimeout(() => {
                        const ripple = document.createElement('div');
                        ripple.className = 'ripple-wave ripple-out-anim';
                        const rippleSize = 80 + r * 150;
                        ripple.style.width = rippleSize + 'px';
                        ripple.style.height = rippleSize + 'px';
                        ripple.style.left = (centerX - rippleSize / 2) + 'px';
                        ripple.style.top = (centerY - rippleSize / 2) + 'px';
                        ripple.style.setProperty('--ripple-color', currentMenuColor);
                        document.body.appendChild(ripple);
                        setTimeout(() => {
                            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
                        }, 1500);
                    }, r * 150);
                }

                // 150 EXPLOSION OUTWARD PARTICLES (INCREASED FROM 100)
                const count = 150;
                for (let i = 0; i < count; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle-explosion-out explosion-out-anim';
                    
                    const size = Math.random() * 16 + 3;
                    particle.style.width = size + 'px';
                    particle.style.height = size + 'px';
                    particle.style.left = centerX + 'px';
                    particle.style.top = centerY + 'px';
                    
                    const colors = [currentMenuColor, '#FFD700', '#00FFFF', '#FF1493', '#00FF00'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.backgroundColor = color;
                    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
                    
                    const angle = (i / count) * Math.PI * 2;
                    const dist = 400 + Math.random() * 400; // MUCH BIGGER DISTANCE
                    const x = Math.cos(angle) * dist;
                    const y = Math.sin(angle) * dist;
                    
                    particle.style.setProperty('--exp-out-x', x + 'px');
                    particle.style.setProperty('--exp-out-y', y + 'px');
                    
                    document.body.appendChild(particle);
                }

                setTimeout(() => {
                    const particles = document.querySelectorAll('.explosion-out-anim, .glow-out, .ripple-out-anim');
                    particles.forEach(p => {
                        if (p.parentNode) p.parentNode.removeChild(p);
                    });
                }, 1500);
            }

            // EXPLOSION INWARD - REAPPEAR ANIMATION WITH RIPPLES (REVERSE OF DISAPPEAR)
            function createExplosionInEffect() {
                const menuRect = menu.getBoundingClientRect();
                const centerX = menuRect.left + menuRect.width / 2;
                const centerY = menuRect.top + menuRect.height / 2;

                // Glow effect
                const glow = document.createElement('div');
                glow.className = 'glow-effect glow-in';
                glow.style.width = '50px';
                glow.style.height = '50px';
                glow.style.left = (centerX - 25) + 'px';
                glow.style.top = (centerY - 25) + 'px';
                glow.style.setProperty('--glow-col', currentMenuColor);
                glow.style.backgroundColor = currentMenuColor;
                document.body.appendChild(glow);

                // CREATE RIPPLES INWARD
                const rippleCount = 3;
                for (let r = 0; r < rippleCount; r++) {
                    setTimeout(() => {
                        const ripple = document.createElement('div');
                        ripple.className = 'ripple-wave ripple-in-anim';
                        const rippleSize = 80 + r * 150;
                        ripple.style.width = rippleSize + 'px';
                        ripple.style.height = rippleSize + 'px';
                        ripple.style.left = (centerX - rippleSize / 2) + 'px';
                        ripple.style.top = (centerY - rippleSize / 2) + 'px';
                        ripple.style.setProperty('--ripple-color', currentMenuColor);
                        document.body.appendChild(ripple);
                        setTimeout(() => {
                            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
                        }, 1500);
                    }, r * 150);
                }

                // 150 EXPLOSION INWARD PARTICLES - REVERSE MOTION (INCREASED FROM 100)
                const count = 150;
                for (let i = 0; i < count; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle-explosion-in explosion-in-anim';
                    
                    const size = Math.random() * 16 + 3;
                    particle.style.width = size + 'px';
                    particle.style.height = size + 'px';
                    particle.style.left = centerX + 'px';
                    particle.style.top = centerY + 'px';
                    
                    const colors = [currentMenuColor, '#FFD700', '#00FFFF', '#FF1493', '#00FF00'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.backgroundColor = color;
                    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
                    
                    const angle = (i / count) * Math.PI * 2;
                    const dist = 400 + Math.random() * 400; // MUCH BIGGER DISTANCE
                    const x = Math.cos(angle) * dist;
                    const y = Math.sin(angle) * dist;
                    
                    particle.style.setProperty('--exp-in-x', x + 'px');
                    particle.style.setProperty('--exp-in-y', y + 'px');
                    
                    document.body.appendChild(particle);
                }

                setTimeout(() => {
                    const particles = document.querySelectorAll('.explosion-in-anim, .glow-in, .ripple-in-anim');
                    particles.forEach(p => {
                        if (p.parentNode) p.parentNode.removeChild(p);
                    });
                }, 1500);
            }

            // Draggable menu
            let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
            menu.querySelector('.menu-title').addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if (menuFading) return;
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                isDragging = true;
            }
            function drag(e) {
                if (isDragging && !menuFading) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    setTranslate(currentX, currentY, menu);
                }
            }
            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }
            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            // Fade out animation
            function fadeOutMenu() {
                if (menuFading) return;
                menuFading = true;
                createExplosionOutEffect();
                menu.classList.add('fade-out');
                setTimeout(() => {
                    menuVisible = false;
                    menuFading = false;
                }, 1500);
            }

            // Fade in animation
            function fadeInMenu() {
                menuFading = true;
                menu.classList.remove('fade-out');
                menu.classList.add('fade-in');
                menu.style.pointerEvents = 'auto';
                menuVisible = true;
                createExplosionInEffect();
                setTimeout(() => {
                    menu.classList.remove('fade-in');
                    menuFading = false;
                }, 1500);
            }

            // Toggling menu with custom hotkey
            document.addEventListener('keydown', function(e) {
                if (e.key === currentHotkey && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    if (document.activeElement && (
                        document.activeElement.tagName === "INPUT" ||
                        document.activeElement.tagName === "TEXTAREA" ||
                        document.activeElement.isContentEditable
                    )) return;
                    
                    if (menuVisible) {
                        fadeOutMenu();
                    } else {
                        fadeInMenu();
                    }
                }
            });

            // UI helpers
            function createAlertWindow(message, title="Message") {
                const alertWindow = document.createElement('div');
                alertWindow.className = 'custom-window';
                alertWindow.innerHTML = `
                    <h4>${title}</h4>
                    <p>${message}</p>
                    <button class="ok"><span>OK</span></button>
                `;
                document.body.appendChild(alertWindow);
                alertWindow.querySelector('.ok').addEventListener('click', () => {
                    document.body.removeChild(alertWindow);
                });
            }
            function customNotificationPopup() {
                const popup = document.createElement('div');
                popup.className = 'custom-window';
                popup.innerHTML = `
                    <h4>Custom Notification</h4>
                    <input id="cc-custom-notification-title" placeholder="Notification Title" maxlength="50" />
                    <textarea id="cc-custom-notification-body" placeholder="Notification Text" rows="3" maxlength="140"></textarea>
                    <button id="cc-custom-notification-send"><span>Show Notification</span></button>
                    <button id="cc-custom-notification-cancel"><span>Cancel</span></button>
                `;
                document.body.appendChild(popup);
                popup.querySelector('#cc-custom-notification-send').addEventListener('click', () => {
                    const title = popup.querySelector('#cc-custom-notification-title').value.trim() || 'Custom Notification';
                    const body = popup.querySelector('#cc-custom-notification-body').value.trim() || '';
                    showCustomNotification(title, body);
                    document.body.removeChild(popup);
                });
                popup.querySelector('#cc-custom-notification-cancel').addEventListener('click', () => {
                    document.body.removeChild(popup);
                });
            }
            function showCustomNotification(title, body) {
                if (typeof Game !== "undefined" && typeof Game.Notify === "function") {
                    Game.Notify(title, body, [16,5]);
                } else {
                    createAlertWindow(body, title);
                }
            }

            // Change Hotkey Popup
            function changeHotkeyPopup() {
                const popup = document.createElement('div');
                popup.className = 'custom-window';
                popup.innerHTML = `
                    <h4>Change Hotkey</h4>
                    <p style="font-size:12px;margin:8px 0;">Press any key to set as the new hotkey:</p>
                    <input id="cc-hotkey-input" type="text" placeholder="Press a key..." readonly style="margin-bottom:12px;" />
                    <button id="cc-hotkey-confirm"><span>Confirm</span></button>
                    <button id="cc-hotkey-cancel"><span>Cancel</span></button>
                `;
                document.body.appendChild(popup);
                
                let capturedKey = '';
                const hotkeyInput = popup.querySelector('#cc-hotkey-input');
                
                const keyHandler = (e) => {
                    e.preventDefault();
                    capturedKey = e.key;
                    hotkeyInput.value = capturedKey === ' ' ? 'Space' : capturedKey;
                };
                
                hotkeyInput.addEventListener('keydown', keyHandler);
                
                popup.querySelector('#cc-hotkey-confirm').addEventListener('click', () => {
                    if (!capturedKey) {
                        createAlertWindow('Please press a key first!', 'Invalid Key');
                        return;
                    }
                    currentHotkey = capturedKey;
                    localStorage.setItem('cc-menu-hotkey', currentHotkey);
                    document.getElementById('cc-hotkey-display').textContent = currentHotkey;
                    document.getElementById('cc-hotkey-display-footer').textContent = currentHotkey;
                    hotkeyInput.removeEventListener('keydown', keyHandler);
                    document.body.removeChild(popup);
                    createAlertWindow(`Hotkey changed to "${currentHotkey}"!`, 'Hotkey Updated');
                });
                
                popup.querySelector('#cc-hotkey-cancel').addEventListener('click', () => {
                    hotkeyInput.removeEventListener('keydown', keyHandler);
                    document.body.removeChild(popup);
                });
            }

            // Building Editors
            const productLevelInput = document.getElementById('cc-product-level-input');
            const setProductLevelBtn = document.getElementById('cc-set-product-level-btn');
            function setProductLevelForAll(val) {
                val = parseInt(val);
                if (isNaN(val) || val < 0) {
                    createAlertWindow("Enter a valid non-negative number.");
                    return;
                }
                let count = 0;
                Object.values(Game.ObjectsById).forEach(obj => {
                    if (typeof obj.level !== "undefined") {
                        obj.level = val;
                        count++;
                    }
                });
                createAlertWindow(`Set product level for ${count} buildings to ${val}.`);
            }
            setProductLevelBtn.onclick = function() {
                setProductLevelForAll(productLevelInput.value);
            };
            productLevelInput.onkeydown = function(e) {
                if (e.key === 'Enter') setProductLevelForAll(productLevelInput.value);
            };

            const buildingAmountInput = document.getElementById('cc-building-amount-input');
            const setBuildingAmountBtn = document.getElementById('cc-set-building-amount-btn');
            function setAllBuildingsAmount(val) {
                val = parseInt(val);
                if (isNaN(val) || val < 0) {
                    createAlertWindow("Enter a valid non-negative number.");
                    return;
                }
                let count = 0;
                Object.values(Game.ObjectsById).forEach(obj => {
                    if (obj.name.toLowerCase() !== "cursor") {
                        obj.amount = val;
                        count++;
                    }
                });
                createAlertWindow(`Set amount for ${count} buildings (except Cursor) to ${val}.`);
            }
            setBuildingAmountBtn.onclick = function() {
                setAllBuildingsAmount(buildingAmountInput.value);
            };
            buildingAmountInput.onkeydown = function(e) {
                if (e.key === 'Enter') setAllBuildingsAmount(buildingAmountInput.value);
            };

            // Doge Mode
            function dogeMode() {
                if (dogeTextActive) {
                    dogeTextActive = false;
                    dogeTextTimers.forEach(clearTimeout);
                    dogeTextTimers = [];
                    Array.from(document.querySelectorAll('.doge-float')).forEach(e=>e.remove());
                    createAlertWindow("Doge Mode OFF. Wow!","Doge Mode");
                    return;
                }
                dogeTextActive = true;
                createAlertWindow("Doge Mode ON. Such fun!","Doge Mode");
                const dogeWords = [
                    "wow", "such cookie", "very click", "so upgrade", "much golden", "many lumps", "so sugar",
                    "very mod", "such cheat", "much fun", "very fast", "so spin", "much wow", "such game", "so bake"
                ];
                function randomColor() {
                    const colors = ["#ff69b4","#ffb347","#b4ff69","#69fff5","#fff569","#b469ff","#69b4ff","#00FFCC"];
                    return colors[Math.floor(Math.random()*colors.length)];
                }
                function spawnDogeText() {
                    if (!dogeTextActive) return;
                    let div = document.createElement('div');
                    div.className = 'doge-float';
                    div.textContent = dogeWords[Math.floor(Math.random()*dogeWords.length)];
                    div.style.left = (Math.random()*80+10)+'vw';
                    div.style.top = (Math.random()*60+20)+'vh';
                    div.style.color = randomColor();
                    document.body.appendChild(div);
                    setTimeout(()=>{div.remove();}, 2500);
                    if (dogeTextActive) {
                        let t = setTimeout(spawnDogeText, Math.random()*480+280);
                        dogeTextTimers.push(t);
                    }
                }
                spawnDogeText();
            }

            // Remove Cheated Achievement Button
            function removeCheatedAchievement() {
                Object.values(Game.AchievementsById).forEach(a => {
                    const forbidden = [
                        "cheated cookies taste awful",
                        "cheated cookies taste awful.",
                        "cheater"
                    ];
                    if (typeof a.name === "string" && forbidden.some(bad => a.name.toLowerCase().includes(bad.toLowerCase()))) {
                        a.won = 0;
                        a.unlocked = 0;
                        a.progress = 0;
                    }
                });
                createAlertWindow("✓ Removed 'Cheated Cookies Taste Awful' achievement!", "Achievement Removed");
            }

            // Danger Feature: Break Game
            function breakGameCursors() {
                if (!confirm('WARNING: This will attempt to set your Cursor amount to a number so large it will break or freeze your game/tab! Are you sure?')) return;
                try {
                    Game.Objects['Cursor'].amount = BigInt("999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999");
                } catch (e) {
                    Game.Objects['Cursor'].amount = Number.MAX_SAFE_INTEGER;
                }
                createAlertWindow("You broke the game. If your browser freezes, that's your fault!","BROKEN GAME");
            }

            // Basic Feature Functions
            function addCookies() {
                let val = parseFloat(document.getElementById('cc-add-cookies').value);
                if (!isNaN(val)) {
                    Game.cookies += val;
                    createAlertWindow(`Added ${val} cookies!`);
                } else {
                    createAlertWindow("Please enter a valid number.");
                }
            }
            function addLumps() {
                let val = parseInt(document.getElementById('cc-add-lumps').value);
                if (!isNaN(val)) {
                    Game.lumps = val;
                    createAlertWindow(`Set lumps to ${val}.`);
                } else {
                    createAlertWindow("Please enter a valid number.");
                }
            }
            function removeCookies() {
                Game.cookies = 0;
                createAlertWindow("Removed all cookies.");
            }
            function toggleAutoClicker() {
                if (!autoClickerOn) {
                    autoClickerInterval = setInterval(()=>Game.ClickCookie(),10);
                    document.getElementById('cc-auto-clicker-btn').innerText = "Stop Auto-Clicker";
                    autoClickerOn = true;
                } else {
                    clearInterval(autoClickerInterval);
                    document.getElementById('cc-auto-clicker-btn').innerText = "Start Auto-Clicker";
                    autoClickerOn = false;
                }
            }

            // UNLOCK ALL UPGRADES
            function unlockAllUpgrades() {
                const excludeNames = [
                    "occult obstruction",
                    "steamed cookies",
                    "ultrascience",
                    "gold hoard",
                    "neuromancy",
                    "perfect idling",
                    "wrinkler doormat",
                    "reindeer season",
                    "eternal seasons",
                    "magic shenanigans",
                    "clucose-charged air",
                    "turbo-charged soil",
                    "a really good guide book"
                ];
                let count = 0;
                Object.values(Game.UpgradesById).forEach(upg => {
                    if (
                        excludeNames.includes(upg.name.toLowerCase()) ||
                        upg.debug ||
                        /debug|test/i.test(upg.name)
                    ) {
                        return;
                    }
                    upg.unlock();
                    if (upg.bought === 0) {
                        upg.bought = 1;
                        if (typeof upg.onBuy === 'function') upg.onBuy();
                    }
                    count++;
                });
                if (typeof Game.RecalculateGains === "function") Game.RecalculateGains();
                createAlertWindow(`Force-bought ${count} upgrades (no debug/test/upgrades in exclusion list)!`);
            }

            // UNLOCK ALL ACHIEVEMENTS
            function unlockAllAchievements() {
                let count = 0;
                Object.values(Game.AchievementsById).forEach(a => {
                    const forbidden = [
                        "cheated cookies taste awful",
                        "cheated cookies taste awful.",
                        "cheated",
                        "cheater",
                        "cheating",
                        "taste awful"
                    ];
                    let skip = false;
                    if (typeof a.id !== "undefined" && (a.id === 7 || a.id === "7")) skip = true;
                    if (typeof a.name === "string" && forbidden.some(bad => a.name.toLowerCase().includes(bad.toLowerCase()))) skip = true;
                    if (typeof a.desc === "string" && forbidden.some(bad => a.desc.toLowerCase().includes(bad.toLowerCase()))) skip = true;
                    if (typeof a.baseDesc === "string" && forbidden.some(bad => a.baseDesc.toLowerCase().includes(bad.toLowerCase()))) skip = true;
                    if (a.won) skip = true;
                    if (!skip) {
                        Game.Win(a.name);
                        count++;
                    }
                });
                createAlertWindow(`Unlocked ${count} achievements (PERMANENTLY blocked "cheated cookies taste awful")!`);
            }

            const fpsInput = document.getElementById('cc-fps-input');
            const setFpsBtn = document.getElementById('cc-set-fps-btn');
            const fpsValue = document.getElementById('cc-fps-value');
            function setFPS(val) {
                val = parseInt(val);
                if (!isNaN(val) && val > 0 && val <= 999999) {
                    Game.fps = val;
                    fpsValue.innerText = val;
                } else {
                    createAlertWindow("Enter a positive FPS value up to 999999.");
                }
            }
            setFpsBtn.onclick = function() {
                setFPS(fpsInput.value);
            };
            fpsInput.onkeydown = function(e) {
                if (e.key === 'Enter') setFPS(fpsInput.value);
            };
            setInterval(()=>{fpsValue.innerText = Game.fps;}, 2000);

           // RUIN THE FUN - Complete Function (Replace existing function)
function ruinTheFun() {
    // Give infinite cookies
    Game.cookies = Number.MAX_SAFE_INTEGER;
    
    // Give infinite lumps
    Game.lumps = Number.MAX_SAFE_INTEGER;
    
    // Buy all buildings to infinity (except Cursor) and set levels to infinity
    let buildingsBought = 0;
    let buildingsLeveled = 0;
    
    Object.values(Game.ObjectsById).forEach(building => {
        if (building.name.toLowerCase() !== "cursor") {
            // Set amount to infinity
            building.amount = Number.MAX_SAFE_INTEGER;
            buildingsBought++;
            
            // Set level to infinity
            if (typeof building.level !== "undefined") {
                building.level = Number.MAX_SAFE_INTEGER;
                buildingsLeveled++;
            }
        }
    });
    
    // Show in-game notification window
    let message = `✓ INFINITY ACHIEVED!\n\n`;
    message += `Cookies: ∞\n`;
    message += `Sugar Lumps: ∞\n`;
    message += `Buildings Purchased: ${buildingsBought}\n`;
    message += `Buildings Leveled: ${buildingsLeveled}`;
    
    Game.Notify("RUIN THE FUN", message, [16, 5]);
}

            // Event listeners
            document.getElementById('cc-set-product-level-btn').onclick = setProductLevelBtn.onclick;
            document.getElementById('cc-product-level-input').onkeydown = productLevelInput.onkeydown;
            document.getElementById('cc-set-building-amount-btn').onclick = setBuildingAmountBtn.onclick;
            document.getElementById('cc-building-amount-input').onkeydown = buildingAmountInput.onkeydown;
            document.getElementById('cc-doge-mode-btn').onclick = dogeMode;
            document.getElementById('cc-add-cookies-btn').onclick = addCookies;
            document.getElementById('cc-add-lumps-btn').onclick = addLumps;
            document.getElementById('cc-remove-cookies-btn').onclick = removeCookies;
            document.getElementById('cc-auto-clicker-btn').onclick = toggleAutoClicker;
            document.getElementById('cc-unlock-upgrades-btn').onclick = unlockAllUpgrades;
            document.getElementById('cc-unlock-achievements-btn').onclick = unlockAllAchievements;
            document.getElementById('cc-remove-cheated-btn').onclick = removeCheatedAchievement;
            document.getElementById('cc-custom-notification-btn').onclick = customNotificationPopup;
            document.getElementById('cc-change-hotkey-btn').onclick = changeHotkeyPopup;
            document.getElementById('cc-ruin-btn').onclick = function() {
    // Create confirmation window
    const confirmWindow = document.createElement('div');
    confirmWindow.className = 'custom-window';
    confirmWindow.innerHTML = `
        <h4>⚠️ WARNING ⚠️</h4>
        <p>This will give you:<br>
        ✓ All Upgrades<br>
        ✓ All Achievements<br>
        ✓ Infinite Cookies<br>
        ✓ Infinite Buildings (except Cursor)<br>
        ✓ Infinite Building Levels<br>
        ✓ Infinite Sugar Lumps<br><br>
        <strong>Are you sure?</strong></p>
        <button id="cc-ruin-confirm" style="margin: 6px; padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"><span>CONTINUE</span></button>
        <button id="cc-ruin-cancel" style="margin: 6px; padding: 6px 12px; background-color: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"><span>CANCEL</span></button>
    `;
    
    document.body.appendChild(confirmWindow);
    
    // Cancel button
    document.getElementById('cc-ruin-cancel').onclick = function() {
        document.body.removeChild(confirmWindow);
    };
    
    // Continue button - Execute all actions
    document.getElementById('cc-ruin-confirm').onclick = function() {
        // Give infinite cookies
        Game.cookies = Number.MAX_VALUE;
        
        // Give infinite sugar lumps
        Game.lumps = Number.MAX_VALUE;
        
        // Unlock ALL upgrades - EXCEPT "Occult Obstruction"
        Object.values(Game.UpgradesById).forEach(upgrade => {
            if (upgrade.name !== "Occult Obstruction") {
                upgrade.bought = 1;
                upgrade.unlocked = 1;
                upgrade.enabled = 1;
            }
        });
        
        // Unlock ALL achievements - no matter what
        Object.values(Game.AchievementsById).forEach(achievement => {
            achievement.won = 1;
            achievement.unlocked = 1;
            achievement.enabled = 1;
        });
        
        // Give infinite buildings (except Cursor) - BUY them to max
        Object.values(Game.ObjectsById).forEach(building => {
            if (building.id !== 0) { // 0 is Cursor
                // Temporarily set cookies to max to allow purchasing
                let originalCookies = Game.cookies;
                Game.cookies = Number.MAX_VALUE;
                
                // Buy building to maximum amount the game allows
                // Keep buying until we can't anymore
                let maxBuyAttempts = 1000;
                for (let i = 0; i < maxBuyAttempts; i++) {
                    if (!building.buy(1)) {
                        break; // Stop if buy fails
                    }
                }
                
                // Set levels to infinite
                building.level = Number.MAX_VALUE;
                
                // Give infinite lumps
                if (building.lumps !== undefined) {
                    building.lumps = Number.MAX_VALUE;
                }
                
                // Restore original cookies (or keep infinite)
                Game.cookies = Number.MAX_VALUE; // Keep infinite to be safe
            }
        });

        // Alternative method if above doesn't work - Direct assignment:
        Object.values(Game.ObjectsById).forEach(building => {
            if (building.id !== 0) { // 0 is Cursor
                building.amount = 999999999; // Set to max safe number
                building.level = 999999999;
                if (building.lumps !== undefined) {
                    building.lumps = Number.MAX_VALUE;
                }
            }
        });

        // Force game update to reflect changes
        Game.recalculateGains();
        
        // Show completion message
        const completionWindow = document.createElement('div');
        completionWindow.className = 'custom-window';
        completionWindow.innerHTML = `
            <h4>✅ FUN RUINED!</h4>
            <p>All cheats have been applied!<br>
            You now have:<br>
            ✓ Infinite Cookies<br>
            ✓ All Upgrades<br>
            ✓ All Achievements<br>
            ✓ Infinite ALL Buildings<br>
            ✓ Infinite Levels<br>
            ✓ Infinite Sugar Lumps</p>
            <button id="cc-completion-ok" style="margin: 6px; padding: 6px 12px; background-color: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"><span>OK</span></button>
        `;
        
        document.body.appendChild(completionWindow);
        
        document.getElementById('cc-completion-ok').onclick = function() {
            document.body.removeChild(completionWindow);
        };
        
        // Remove the confirmation window
        document.body.removeChild(confirmWindow);
    };
};
            document.getElementById('cc-break-game-btn').onclick = breakGameCursors;
            document.getElementById('cc-close-btn').onclick = () => fadeOutMenu();

            // Console info
            console.log('Jayden\'s Mod Menu loaded. Drag the top bar to move. Press "' + currentHotkey + '" to toggle menu visibility.');
        }

        // Show welcome screen first
        showWelcomeScreen();
    }
})();
