import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EmotionHistoryEntry, Emotion } from '../types'; // Corrected import for Emotion
import { EMOTIONS } from '../constants'; // Corrected import for EMOTIONS

interface EmotionHistoryChartProps {
  data: EmotionHistoryEntry[];
}

const emotionColorMap: Record<Emotion | 'Undetermined' | 'Initializing', string> = {
  Happy: '#FFD700', // Gold
  Sad: '#1E90FF',   // DodgerBlue
  Angry: '#FF4500', // OrangeRed
  Surprised: '#9400D3', // DarkViolet
  Fearful: '#808080', // Gray
  Disgusted: '#32CD32', // LimeGreen
  Neutral: '#FFFFFF', // White
  Undetermined: '#555555', // Darker Gray
  Initializing: '#AAAAAA', // Light Gray
};

const EmotionHistoryChart: React.FC<EmotionHistoryChartProps> = ({ data }) => {
  // Prepare data for the chart: transform emotion string to a numerical value for Y-axis
  // And create a line for each emotion if we want multi-line chart,
  // Or just plot the dominant emotion. For simplicity, let's plot dominant emotion.

  const chartData = data.map(entry => ({
    time: entry.time,
    [entry.emotion]: entry.confidence, // Plot confidence for the detected emotion
    _emotionValue: EMOTIONS.indexOf(entry.emotion as Emotion) + 1, // Numerical value for dominant emotion line
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
        <XAxis dataKey="time" stroke="#cbd5e0" />
        <YAxis
          stroke="#cbd5e0"
          domain={[0, 1]} // Confidence from 0 to 1
          tickFormatter={(value) => `${Math.round(value * 100)}%`}
          label={{ value: 'Confidence', angle: -90, position: 'insideLeft', fill: '#cbd5e0' }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
          itemStyle={{ color: '#cbd5e0' }}
          labelStyle={{ color: '#cbd5e0' }}
          formatter={(value: number, name: string) => [`${Math.round(value * 100)}%`, name]}
        />
        <Legend />
        {/* Plot a line for each emotion's confidence, or just a single line for the dominant emotion's confidence */}
        {/* For now, let's just plot the dominant emotion's confidence */}
        {EMOTIONS.map(emotion => (
          <Line
            key={emotion}
            type="monotone"
            dataKey={emotion} // This will only show a point when that emotion is dominant
            stroke={emotionColorMap[emotion]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EmotionHistoryChart;