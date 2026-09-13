import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const AnimalCharacter = ({ emotion, className, onClick }) => (
  <svg width="100" height="100" viewBox="0 0 100 100" className={className} onClick={onClick}>
    <ellipse cx="22" cy="18" rx="11" ry="15" fill="#FFD700" transform="rotate(-20 22 18)" />
    <ellipse cx="78" cy="18" rx="11" ry="15" fill="#FFD700" transform="rotate(20 78 18)" />
    <circle cx="50" cy="50" r="40" fill="#FFD700" />
    <ellipse cx="28" cy="58" rx="8" ry="5" fill="#FF9EB5" opacity="0.7" />
    <ellipse cx="72" cy="58" rx="8" ry="5" fill="#FF9EB5" opacity="0.7" />
    <circle cx="35" cy="40" r="5" fill="#000" />
    <circle cx="65" cy="40" r="5" fill="#000" />
    {emotion === 'eating' ? (
      <circle cx="50" cy="65" r="15" fill="#000" />
    ) : emotion === 'happy' ? (
      <path d="M 30 60 Q 50 80 70 60" stroke="#000" strokeWidth="3" fill="none" />
    ) : emotion === 'excited' ? (
      <path d="M 30 50 Q 50 80 70 50" stroke="#000" strokeWidth="3" fill="none" />
    ) : (
      <line x1="30" y1="60" x2="70" y2="60" stroke="#000" strokeWidth="3" />
    )}
  </svg>
);

const Ball = ({ ball, onMouseDown }) => (
  <div
    data-id={ball.id}
    className={`absolute w-12 h-12 rounded-full cursor-pointer bg-${ball.color}-500`}
    style={{
      left: `${ball.x}%`,
      top: `${ball.y}%`,
      userSelect: 'none',
      zIndex: 2
    }}
    onMouseDown={onMouseDown}
  >
    <span className="absolute left-[22%] top-[28%] w-[14%] h-[14%] rounded-full bg-gray-800 pointer-events-none" />
    <span className="absolute right-[22%] top-[28%] w-[14%] h-[14%] rounded-full bg-gray-800 pointer-events-none" />
    <span className="absolute left-[30%] top-[50%] w-[40%] h-[18%] border-b-[3px] border-gray-800 rounded-b-full pointer-events-none" />
    <span className="absolute left-[14%] top-[12%] w-[28%] h-[16%] rounded-full bg-white/50 pointer-events-none" />
  </div>
);

const CongratulationsMessage = ({ elapsedTime, onRestart }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-opacity-80 overflow-hidden">
    <div className="text-center relative w-full h-full flex flex-col justify-center items-center">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `scale(${0.5 + Math.random() * 0.5})`
            }}
          >
            <AnimalCharacter
              emotion={Math.random() > 0.5 ? 'excited' : 'happy'}
              className="w-20 h-20"
            />
          </div>
        ))}
      </div>
      <div className="relative">
        <AnimalCharacter
          emotion="excited"
          className="w-40 h-40 animate-bounce mb-4"
        />
      </div>
      <h2 className="text-6xl font-bold mb-4 text-yellow-300 
                     transition-all duration-1000 transform scale-150 animate-pulse
                     drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
        おめでとう！
      </h2>
      <p className="text-4xl text-white 
                    transition-all duration-1000 transform scale-125 animate-bounce
                    drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        やったね！！
      </p>
      <div className="mt-8 flex justify-center items-center space-x-2
                      bg-white/20 backdrop-blur-sm rounded-full px-6 py-3
                      animate-pulse">
        <Timer className="w-6 h-6 text-white" />
        <p className="text-2xl text-white">クリアタイム: {elapsedTime}びょう</p>
      </div>
      <Button 
        onClick={onRestart} 
        className="mt-12 bg-yellow-400 hover:bg-yellow-500 text-black font-bold
                   py-3 px-6 rounded-full text-xl transition-all duration-300
                   transform hover:scale-105 animate-bounce-slow
                   shadow-[0_0_15px_rgba(255,255,255,0.5)]"
      >
        もういっかいする
      </Button>
      <Button
        className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
        onClick={() => window.location.href = 'https://manabi-time.com/mouse/'}
      >
        もどる
      </Button>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2
                      animate-rise opacity-50">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-yellow-300"
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              left: `${Math.random() * 1000 - 500}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const Game = () => {
  const [balls, setBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [characterEmotion, setCharacterEmotion] = useState('neutral');
  const [characterMessage, setCharacterMessage] = useState('ボールを運んでね！');
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const gameAreaRef = useRef(null);
  const characterRef = useRef(null);
  const [draggingBallId, setDraggingBallId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEating, setIsEating] = useState(false);
  const [eatingTimeout, setEatingTimeout] = useState(null);

  // タイムアウトをクリアする
  useEffect(() => {
    return () => {
      if (eatingTimeout) {
        clearTimeout(eatingTimeout);
      }
    };
  }, [eatingTimeout]);

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
  const BALL_SIZE_PERCENT = 6;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowWarning(true);
    setTimeout(() => {
      setShowWarning(false);
    }, 1000);
  };

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const clampPosition = (x, y) => {
    const minX = 0;
    const maxX = 100 - BALL_SIZE_PERCENT;
    const minY = 0;
    const maxY = 100 - BALL_SIZE_PERCENT;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  };

  const initializeGame = useCallback(() => {
    const newBalls = Array.from({ length: 20 }, (_, index) => {
      let x, y;
      do {
        x = Math.random() * (90 - BALL_SIZE_PERCENT) + 5;
        y = Math.random() * (50 - BALL_SIZE_PERCENT) + 5;
      } while (x > 40 && x < 60 && y > 50 - BALL_SIZE_PERCENT);

      return {
        id: index,
        x,
        y,
        color: getRandomColor(),
        status: 'active',
      };
    });

    setBalls(newBalls);
    setScore(0);
    setGameOver(false);
    setCharacterEmotion('neutral');
    setCharacterMessage('ボールを運んでね！');
    setShowCongratulations(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  useEffect(() => {
    initializeGame();
    setAudioContext(new (window.AudioContext || window.webkitAudioContext)());
  }, [initializeGame]);

  useEffect(() => {
    let timer;
    if (startTime && !gameOver) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, gameOver]);

  const playSound = useCallback((frequency, duration) => {
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    }
  }, [audioContext]);

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    const ballElement = e.currentTarget;
    const rect = ballElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggingBallId(id);
    setDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (dragging && draggingBallId !== null) {
      e.preventDefault();
      const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - gameAreaRect.left - dragOffset.x;
      const y = e.clientY - gameAreaRect.top - dragOffset.y;

      const xPercent = (x / gameAreaRect.width) * 100;
      const yPercent = (y / gameAreaRect.height) * 100;

      // 位置を制限
      const clampedPosition = clampPosition(xPercent, yPercent);

      setBalls((prevBalls) =>
        prevBalls.map((ball) =>
          ball.id === draggingBallId
            ? { ...ball, x: clampedPosition.x, y: clampedPosition.y }
            : ball
        )
      );
    }
  };

  const handleMouseUp = (e) => {
    if (dragging && draggingBallId !== null) {
      e.preventDefault();
      const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - gameAreaRect.left - dragOffset.x;
      const y = e.clientY - gameAreaRect.top - dragOffset.y;

      const xPercent = (x / gameAreaRect.width) * 100;
      const yPercent = (y / gameAreaRect.height) * 100;

      const clampedPosition = clampPosition(xPercent, yPercent);

      const characterRect = characterRef.current.getBoundingClientRect();

      if (
        e.clientX >= characterRect.left &&
        e.clientX <= characterRect.right &&
        e.clientY >= characterRect.top &&
        e.clientY <= characterRect.bottom
      ) {
        playSound(440, 0.1);

        // 既存のタイムアウトをクリア
        if (eatingTimeout) {
          clearTimeout(eatingTimeout);
        }

        // ボールを消す
        setBalls((prevBalls) =>
          prevBalls.filter((ball) => ball.id !== draggingBallId)
        );

        // スコアを更新
        setScore((prevScore) => {
          const newScore = prevScore + 5;
          return newScore;
        });

        // 食べるアニメーションを開始
        setIsEating(true);
        setCharacterEmotion('eating');

        // 新しいタイムアウトを設定
        const timeout = setTimeout(() => {
          setIsEating(false);
          const nextScore = score + 5;

          // スコアに応じてメッセージと感情を更新
          if (nextScore % 25 === 0) {
            setCharacterMessage('すごい！ がんばってるね！');
            setCharacterEmotion('excited');
          } else if (nextScore % 15 === 0) {
            setCharacterMessage('そのちょうし！');
            setCharacterEmotion('happy');
          } else {
            setCharacterEmotion('neutral');
          }
        }, 500);

        setEatingTimeout(timeout);
      } else {
        setBalls((prevBalls) =>
          prevBalls.map((ball) =>
            ball.id === draggingBallId
              ? { ...ball, x: clampedPosition.x, y: clampedPosition.y }
              : ball
          )
        );
      }

      setDragging(false);
      setDraggingBallId(null);
    }
  };

  useEffect(() => {
    if (balls.length === 0 && score > 0) {
      setGameOver(true);
      setCharacterEmotion('excited');
      setCharacterMessage('やったね！ くりあだよ！');
      playSound(523.25, 0.5);
      setShowCongratulations(true);
    } else if (balls.length <= 5 && !isEating) {
      setCharacterEmotion('happy');
      setCharacterMessage('もうすこし！');
    }
  }, [balls, score, playSound, isEating]);

  return (
    <div
      className="w-full min-h-screen bg-blue-100 p-4 flex justify-center"
      onContextMenu={handleContextMenu}
    >
      <div className="w-full max-w-2xl relative">
        <h1 className="text-2xl font-bold mb-4 text-center">ボールはこびゲーム</h1>
        <div className="relative flex justify-center mb-6">
          <div className="bg-white rounded-full px-8 py-2 shadow-md text-4xl font-bold text-orange-500">
            てんすう {score}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
            <Timer className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold text-blue-500">{elapsedTime}びょう</span>
          </div>
        </div>

        {showWarning && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <Alert className="bg-yellow-100 border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg shadow-lg animate-bounce">
              <AlertTriangle className="h-6 w-6 inline-block mr-2" />
              <span className="text-xl font-bold">みぎクリックしないでね</span>
            </Alert>
          </div>
        )}

        <div
          ref={gameAreaRef}
          className="w-full h-[420px] bg-gradient-to-b from-slate-900 to-indigo-950 rounded-2xl relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute top-4 left-8 w-1.5 h-1.5 bg-white rounded-full animate-twinkle" aria-hidden="true" />
          <div className="absolute top-10 left-24 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.4s' }} aria-hidden="true" />
          <div className="absolute top-6 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.8s' }} aria-hidden="true" />
          <div className="absolute top-16 right-16 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.2s' }} aria-hidden="true" />
          <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.2s' }} aria-hidden="true" />
          <div className="absolute top-24 left-12 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.6s' }} aria-hidden="true" />
          <div className="absolute top-20 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.6s' }} aria-hidden="true" />
          <div className="absolute top-32 right-24 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }} aria-hidden="true" />
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            ref={characterRef}
            style={{ zIndex: 1 }}
          >
            <AnimalCharacter
              emotion={characterEmotion}
              className="w-32 h-32 transition-all duration-300"
            />
          </div>
          {balls.map((ball) => (
            <Ball key={ball.id} ball={ball} onMouseDown={(e) => handleMouseDown(e, ball.id)} />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-md text-lg font-bold">{characterMessage}</div>
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
            onClick={() => window.location.href = 'https://manabi-time.com/mouse/'}
          >
            もどる
          </Button>
        </div>
      </div>
      {showCongratulations && (
        <CongratulationsMessage elapsedTime={elapsedTime} onRestart={initializeGame} />
      )}
    </div>
  );
};

export default Game;