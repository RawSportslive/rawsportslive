import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CountdownTimerProps {
  targetIso: string;       // ISO date string of scheduled start
  onStarted?: () => void;  // Called when countdown reaches zero
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetIso, onStarted }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const target = new Date(targetIso).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('STARTING NOW');
        if (!started) {
          setStarted(true);
          onStarted?.();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${pad(hours)}h ${pad(minutes)}m`);
      } else {
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!timeLeft) return null;

  const isImminent = timeLeft === 'STARTING NOW';

  return (
    <View style={[styles.container, isImminent && styles.containerImminent]}>
      <Text style={styles.label}>STARTS IN</Text>
      <Text style={[styles.time, isImminent && styles.timeImminent]}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: '#2d2d50',
  },
  containerImminent: {
    backgroundColor: '#E5091415',
    borderColor: '#E50914',
  },
  label: {
    color: '#666',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  time: {
    color: '#C77DFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timeImminent: {
    color: '#E50914',
  },
});
