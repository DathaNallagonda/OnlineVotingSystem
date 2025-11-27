import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoteCounterProps {
  targetCount: number;
  duration?: number;
}

const VoteCounter = ({ targetCount, duration = 2000 }: VoteCounterProps) => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * targetCount);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(targetCount);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(updateCount);
  }, [targetCount, duration]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center"
      >
        <p className="text-lg font-medium text-gray-600 mb-2">Total Votes Cast</p>
        
        <div className="flex items-center justify-center gap-2">
          <AnimatePresence mode="popLayout">
            {String(count).split("").map((digit, index) => (
              <motion.div
                key={`${index}-${digit}-${count}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <span className="text-6xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {digit}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isAnimating && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-2xl ml-2"
            >
              ⭐
            </motion.span>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 mt-3"
        >
          {isAnimating ? "Counting votes..." : "Thank you for participating!"}
        </motion.p>
      </motion.div>

      {/* Confetti effect when animation completes */}
      {!isAnimating && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                opacity: 0,
              }}
              transition={{ duration: 1, delay: 0.1 }}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  "#3B82F6",
                  "#8B5CF6",
                  "#EC4899",
                  "#F59E0B",
                  "#10B981",
                ][i % 5],
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default VoteCounter;
