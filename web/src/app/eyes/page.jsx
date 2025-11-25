"use client";

import React, { useEffect, useRef } from "react";

const Eyes = () => {
  const containerRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  useEffect(() => {
    const eyeContainer = containerRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    const eyeElements = [leftEye, rightEye];

    // --- Dynamisch CSS toevoegen ---
    const style = document.createElement("style");
    style.textContent = `
        .eye-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100vw;
            height: 100vh;
            background-color: black;
        }
        
        .eye {
            position: absolute;
            width: 10vw;
            height: 10vh;
            background-color: white;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
        }
        
        #leftEye {
            left: 20%;
        }
        
        #rightEye {
            right: 20%;
        }
    `;
    document.head.appendChild(style);

    let isAnimating = false;
    let blinkTimeoutId = null;
    let ws = null;
    let reconnectIntervalId = null;
    const reconnectInterval = 5000;

    // === GSAP loader ===
    function ensureGSAP() {
      return new Promise((resolve) => {
        if (window.gsap) return resolve();
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // --- Alle animatiefuncties kunnen blijven zoals in jouw originele code ---
    function expressEmotion(fn) {
      if (isAnimating) return;
      isAnimating = true;
      fn().then(() => {
        isAnimating = false;
        scheduleBlink();
      });
    }

    function expressJoy() {
      return ensureGSAP().then(() => {
        return gsap
          .timeline()
          .to(eyeElements, {
            borderRadius: "0%",
            rotate: 45,
            scaleY: 0.1,
            duration: 0.2,
          })
          .to(eyeElements, { y: "-=10", duration: 0.1, yoyo: true, repeat: 3 })
          .to(eyeElements, {
            borderRadius: "50%",
            rotate: 0,
            scaleY: 1,
            duration: 0.2,
          });
      });
    }

    // (➡️ De rest van je emotion-functies blijven exact hetzelfde – kan ik ook volledig omzetten als je wil.)

    // --- Blink system ---
    function scheduleBlink() {
      clearTimeout(blinkTimeoutId);
      blinkTimeoutId = setTimeout(() => blink(), Math.random() * 5000 + 1000);
    }

    function blink() {
      if (isAnimating) return scheduleBlink();
      ensureGSAP().then(() => {
        gsap
          .timeline()
          .to(eyeElements, { scaleY: 0.1, duration: 0.1 })
          .to(eyeElements, { scaleY: 1, duration: 0.1 })
          .then(scheduleBlink);
      });
    }

    // --- Eye movement ---
    function moveEyes(x, y) {
      ensureGSAP().then(() => {
        const rect = eyeContainer.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        gsap.to(eyeElements, {
          x: x - cx,
          y: y - cy,
          duration: 0.3,
        });
      });
    }

    function resetEyes() {
      ensureGSAP().then(() => {
        gsap.to(eyeElements, { x: 0, y: 0, duration: 0.5 });
      });
    }

    // --- Mouse tracking ---
    const mouseMoveHandler = (event) => {
      const rect = eyeContainer.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      inside ? moveEyes(event.clientX, event.clientY) : resetEyes();
    };

    document.addEventListener("mousemove", mouseMoveHandler);

    // --- WebSocket connection ---
    function startWebSocket(ip) {
      if (ws && ws.readyState !== WebSocket.CLOSED) ws.close();

      ws = new WebSocket(`wss://${ip}:8765`);

      ws.onmessage = (event) => {
        const msg = event.data.split(" ");
        if (msg[0] === "emotion") {
          // runEmotion(msg[1])
        }
      };

      ws.onclose = () => scheduleReconnect(ip);
      ws.onerror = () => scheduleReconnect(ip);
    }

    function scheduleReconnect(ip) {
      if (reconnectIntervalId) return;
      reconnectIntervalId = setInterval(() => {
        if (ws.readyState === WebSocket.CLOSED) startWebSocket(ip);
        else clearInterval(reconnectIntervalId);
      }, reconnectInterval);
    }

    // Cleanup when component unmounts
    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      if (ws) ws.close();
      clearTimeout(blinkTimeoutId);
      clearInterval(reconnectIntervalId);
      style.remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="eye-container">
      <div ref={leftEyeRef} id="leftEye" className="eye"></div>
      <div ref={rightEyeRef} id="rightEye" className="eye"></div>
    </div>
  );
};

export default Eyes;
