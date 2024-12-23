import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const AnimalCharacter = ({ emotion, className, onClick }) => (
  <svg width="100" height="100" viewBox="0 0 100 100" className={className} onClick={onClick}>
    <circle cx="50" cy="50" r="40" fill="#FFD700" />
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

const CongratulationsMessage = ({ elapsedTime, onRestart }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-opacity-80">
    <div className="text-center relative w-full h-full flex flex-col justify-center items-center">
      <AnimalCharacter emotion="excited" className="w-40 h-40 animate-bounce mb-4" />
      <h2 className="text-6xl font-bold mb-4 text-yellow-300 
                     transition-all duration-1000 transform scale-150 animate-pulse">
        おめでとう！
      </h2>
      <p className="text-4xl text-white 
                    transition-all duration-1000 transform scale-125 animate-bounce">
        やったね！！
      </p>
      <div className="mt-8 flex justify-center items-center space-x-2">
        <Timer className="w-6 h-6 text-white" />
        <p className="text-2xl text-white">クリアタイム: {elapsedTime}びょう</p>
      </div>
      <Button 
        onClick={onRestart} 
        className="mt-12 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full text-xl transition-all duration-300 transform hover:scale-105"
      >
        もういっかいする
      </Button>
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

        setBalls((prevBalls) =>
          prevBalls.filter((ball) => ball.id !== draggingBallId)
        );

        setCharacterEmotion('eating');
        
        setScore((prevScore) => {
          const newScore = prevScore + 5;
          let newMessage = characterMessage;
          if (newScore % 25 === 0) {
            newMessage = 'すごい！ がんばってるね！';
          } else if (newScore % 15 === 0) {
            newMessage = 'そのちょうし！';
          }
          setCharacterMessage(newMessage);
          return newScore;
        });

        setTimeout(() => {
          setCharacterEmotion((prevScore) => {
            if (prevScore % 25 === 0) return 'excited';
            if (prevScore % 15 === 0) return 'happy';
            return 'neutral';
          });
        }, 300);
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
    } else if (balls.length <= 5) {
      setCharacterEmotion('happy');
      setCharacterMessage('もうすこし！');
    }
  }, [balls, score, playSound]);

  return (
    <div 
      className="w-full h-screen bg-blue-100 p-4 relative"
      onContextMenu={handleContextMenu}
    >
      <h1 className="text-2xl font-bold mb-4">ボールはこびゲーム</h1>
      <div className="text-6xl font-bold mb-6 text-center">てんすう: {score}</div>
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Timer className="w-6 h-6" />
        <span className="text-xl font-bold">{elapsedTime}びょう</span>
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
        className="w-full h-64 bg-white relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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
          <div
            key={ball.id}
            data-id={ball.id}
            className={`absolute w-12 h-12 rounded-full cursor-pointer bg-${ball.color}-500`}
            style={{ 
              left: `${ball.x}%`, 
              top: `${ball.y}%`, 
              userSelect: 'none',
              zIndex: 2
            }}
            onMouseDown={(e) => handleMouseDown(e, ball.id)}
          />
        ))}
      </div>
      <div className="absolute bottom-4 left-4 flex items-center">
        <div className="ml-4 text-lg font-bold">{characterMessage}</div>
      </div>
      {showCongratulations && (
        <CongratulationsMessage elapsedTime={elapsedTime} onRestart={initializeGame} />
      )}
    </div>
  );
};

export default Game;