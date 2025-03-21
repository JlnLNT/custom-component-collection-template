import { useEffect, useState } from 'react';
import { Retool } from '@tryretool/custom-component-support';

// Changed to default export
export const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [audioURL, setAudioURL] = Retool.useStateString({ name: 'audioURL' });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        const elapsed = Date.now() - (startTime || 0);
        const minutes = Math.floor(elapsed / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
        setCurrentTime(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setAudioChunks([]);
      
      mediaRecorder.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data]);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStartTime(Date.now());

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    setCurrentTime('00:00');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      maxWidth: '300px'
    }}>
      <div style={{ fontSize: '20px', fontWeight: '500' }}>Chimney Repair C457897</div>
      
      <div style={{ fontSize: '24px', fontFamily: 'monospace' }}>{currentTime}</div>
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isRecording ? '#ff4444' : '#4CAF50',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          
        }}
      />
      
      <button
        onClick={() => Retool.useEventCallback({ name: 'onDone' })}
        style={{
          padding: '8px 16px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Done
      </button>
    </div>
  );
};

export default AudioRecorder