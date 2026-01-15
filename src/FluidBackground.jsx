import { useEffect, useRef } from 'react';
import './FluidBackground.scss';

const MIN_SPEED = 0.5;
const MAX_SPEED = 2;

const randomNumber = (min, max) => Math.random() * (max - min) + min;

const FluidBackground = () => {
  const containerRef = useRef(null);
  const blobsRef = useRef([]);

  useEffect(() => {
    const blobElements = containerRef.current.querySelectorAll('.blob');
    const instances = [];

    // 初始化每個 Blob 的數據
    blobElements.forEach((el) => {
      const size = el.offsetWidth;
      const initialX = randomNumber(0, window.innerWidth - size);
      const initialY = randomNumber(0, window.innerHeight - size);

      // 設定初始位置
      el.style.top = `${initialY}px`;
      el.style.left = `${initialX}px`;

      instances.push({
        el,
        size,
        initialX,
        initialY,
        x: initialX,
        y: initialY,
        vx: randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
        vy: randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
      });
    });

    let animationFrameId;

    const update = () => {
      instances.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        // 邊界碰撞檢測
        if (blob.x >= window.innerWidth - blob.size || blob.x <= 0) {
          blob.vx *= -1;
        }
        if (blob.y >= window.innerHeight - blob.size || blob.y <= 0) {
          blob.vy *= -1;
        }

        // 使用 transform 效能較好
        blob.el.style.transform = `translate(${blob.x - blob.initialX}px, ${
          blob.y - blob.initialY
        }px)`;
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    // 清除機制：組件卸載時停止動畫
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="blobs" ref={containerRef}>
      {[...Array(7)].map((_, i) => (
        <div key={i} className="blob" />
      ))}
    </div>
  );
};

export default FluidBackground;
